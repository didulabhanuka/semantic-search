import { generateEmbedding, generateEmbeddings } from '../lib/embeddings.js';
import { chunkText, estimateChunkTokens } from '../lib/chunker.js';
import { db } from '../lib/db.js';

export async function ingestDocument(documentId) {
  // Fetch the raw text from the database
  const { rows } = await db.query(
    'SELECT raw_text FROM documents WHERE id = $1',
    [documentId]
  );

  if (!rows.length) throw new Error(`Document ${documentId} not found`);

  const rawText = rows[0].raw_text;

  // Split into chunks
  const chunks = chunkText(rawText);

  // Update the document with total chunk count
  await db.query(
    'UPDATE documents SET chunk_count = $1, status = $2 WHERE id = $3',
    [chunks.length, 'processing', documentId]
  );

  console.log(`Document ${documentId}: ${chunks.length} chunks to embed`);

  let totalTokens = 0;

  // Embed and store each chunk
  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i];
    const tokenCount = estimateChunkTokens(content);
    totalTokens += tokenCount;

    // Generate embedding for this chunk
    const embedding = await generateEmbedding(content);

    // Store chunk + embedding in the database
    await db.query(
      `INSERT INTO chunks (document_id, chunk_index, content, token_count, embedding)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        documentId,
        i,
        content,
        tokenCount,
        `[${embedding.join(',')}]`, // pgvector format
      ]
    );

    // Update progress so frontend can poll it
    await db.query(
      'UPDATE documents SET chunks_processed = $1 WHERE id = $2',
      [i + 1, documentId]
    );

    console.log(`  Embedded chunk ${i + 1} / ${chunks.length}`);
  }

  // Mark document as ready
  await db.query(
    'UPDATE documents SET status = $1, tokens_used = $2 WHERE id = $3',
    ['ready', totalTokens, documentId]
  );

  console.log(`Document ${documentId} ingestion complete. Tokens used: ${totalTokens}`);
}