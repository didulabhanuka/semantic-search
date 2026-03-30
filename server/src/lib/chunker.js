// Rough token estimator for all-MiniLM-L6-v2
// ~4 characters per token is a good approximation
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

function splitIntoSentences(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

export function chunkText(text, maxTokens = 512, overlapTokens = 50) {
  const sentences = splitIntoSentences(text);
  const chunks = [];

  let current = [];
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    // If adding this sentence exceeds the limit, save current chunk
    if (currentTokens + sentenceTokens > maxTokens && current.length > 0) {
      chunks.push(current.join(' '));

      // Build overlap: walk back through current sentences
      // until we hit the overlap token budget
      const overlap = [];
      let overlapCount = 0;

      for (let i = current.length - 1; i >= 0; i--) {
        const t = estimateTokens(current[i]);
        if (overlapCount + t > overlapTokens) break;
        overlap.unshift(current[i]);
        overlapCount += t;
      }

      current = overlap;
      currentTokens = overlapCount;
    }

    current.push(sentence);
    currentTokens += sentenceTokens;
  }

  // Don't forget the last chunk
  if (current.length > 0) {
    chunks.push(current.join(' '));
  }

  return chunks;
}

export function estimateChunkTokens(chunk) {
  return estimateTokens(chunk);
}