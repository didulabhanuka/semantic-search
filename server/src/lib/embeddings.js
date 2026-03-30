import { pipeline } from '@xenova/transformers';

let embedder = null;

async function getEmbedder() {
  if (embedder) return embedder;

  console.log('Loading embedding model... (first time takes ~30 seconds)');

  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('Embedding model loaded and cached.');

  return embedder;
}

export async function generateEmbedding(text) {
  const embedder = await getEmbedder();

  const output = await embedder(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(output.data);
}

export async function generateEmbeddings(texts) {
  const results = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
  }

  return results;
}