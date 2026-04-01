import { generateEmbedding } from '../lib/embeddings.js';
import { db } from '../lib/db.js';
import { redis } from '../lib/redis.js';
import { createHash } from 'crypto';

export async function semanticSearch(query, { limit = 10, documentIds = [], hybrid = true } = {}) {

  // Build a cache key from all search parameters
  const cacheKey = 'search:' + createHash('md5')
    .update(JSON.stringify({ query, limit, documentIds, hybrid }))
    .digest('hex');

  // Return cached result if available
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log('Cache hit for query:', query);
    return JSON.parse(cached);
  }

  // Embed the query using the same model used during ingestion
  const embedding = await generateEmbedding(query.trim());
  const qVec = `[${embedding.join(',')}]`;

  // Optionally filter by specific documents
  const docFilter = documentIds.length > 0
    ? 'AND c.document_id = ANY($3::uuid[])'
    : '';

  let sql, params;

  if (hybrid) {
    // Blend vector similarity (70%) with full-text rank (30%)
    sql = `
      SELECT
        c.id,
        c.content,
        c.chunk_index,
        c.document_id,
        d.filename,
        (0.7 * (1 - (c.embedding <=> $1::vector)))
        + (0.3 * ts_rank(c.fts, plainto_tsquery('english', $2))) AS score
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      WHERE d.status = 'ready'
      ${docFilter}
      ORDER BY score DESC
      LIMIT ${limit}
    `;

    params = documentIds.length > 0
      ? [qVec, query, documentIds]
      : [qVec, query];

  } else {
    // Pure vector search only
    sql = `
      SELECT
        c.id,
        c.content,
        c.chunk_index,
        c.document_id,
        d.filename,
        1 - (c.embedding <=> $1::vector) AS score
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      WHERE d.status = 'ready'
      ${docFilter}
      ORDER BY c.embedding <=> $1::vector
      LIMIT ${limit}
    `;

    params = documentIds.length > 0
      ? [qVec, documentIds]
      : [qVec];
  }

  const { rows } = await db.query(sql, params);

  // Filter out low confidence results and shape the response
  const results = rows
    .filter(r => r.score >= 0.3)
    .map(r => ({
      id: r.id,
      content: r.content,
      score: Math.round(r.score * 1000) / 1000,
      chunkIndex: r.chunk_index,
      document: {
        id: r.document_id,
        filename: r.filename,
      },
    }));

  // Cache for 10 minutes
  await redis.setex(cacheKey, 600, JSON.stringify(results));

  return results;
}

function extractRelevantSentences(content, query, maxSentences = 3) {
  const queryWords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3); // ignore short words like "the", "how"

  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 20);

  // Score each sentence by how many query words it contains
  const scored = sentences.map(sentence => {
    const lower = sentence.toLowerCase();
    const score = queryWords.filter(w => lower.includes(w)).length;
    return { sentence, score };
  });

  // Sort by score, take top N, then restore original order
  const topSentences = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .map(s => s.sentence);

  // If no keyword overlap at all, just take first 2 sentences
  if (topSentences.length === 0) {
    return sentences.slice(0, 2);
  }

  return topSentences;
}

async function demoAnswer(query, results, res) {
  const lines = [
    `**Demo Mode** — Add ANTHROPIC_API_KEY to .env for full AI answers.\n\n`,
    `Based on the top ${results.length} matching passages:\n\n`,
  ];

  results.slice(0, 3).forEach((r, i) => {
    const sentences = extractRelevantSentences(r.content, query);
    lines.push(`[${i + 1}] *${r.document.filename}*\n${sentences.join(' ')}\n\n`);
  });

  lines.push(`---\n*Semantic similarity search found these passages without exact keyword matching.*`);

  const fullText = lines.join('');

  // Stream character by character for typewriter effect
  for (const char of fullText) {
    res.write(`data: ${JSON.stringify({ text: char })}\n\n`);
    await new Promise(r => setTimeout(r, 8)); // 8ms per char
  }

  res.write('data: [DONE]\n\n');
  res.end();
}

export async function ragAnswer(query, res) {
  const results = await semanticSearch(query, { limit: 5 });

  if (!results.length) {
    res.write(`data: ${JSON.stringify({ text: 'No relevant documents found for your query.' })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // Fall back to demo mode if no API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here' || !apiKey.startsWith('sk-ant-')) {
    await demoAnswer(query, results, res);
    return;
  }

  const context = results
    .map((r, i) => `[${i + 1}] (${r.document.filename})\n${r.content}`)
    .join('\n\n');

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: 'Answer using ONLY the provided context. Cite sources as [1], [2] etc. Be concise and accurate.',
    messages: [
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`
      }
    ]
  });

  stream.on('text', (text) => {
    res.write(`data: ${JSON.stringify({ text })}\n\n`);
  });

  stream.on('finalMessage', () => {
    res.write('data: [DONE]\n\n');
    res.end();
  });

  stream.on('error', (err) => {
    console.error('Claude stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
    res.end();
  });
}