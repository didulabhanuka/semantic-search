import { db } from '../lib/db.js';
import { ingestQueue } from '../lib/redis.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function uploadDocument(file) {
  const { originalname, mimetype, buffer } = file;

  // Extract raw text based on file type
  let rawText = '';

  if (mimetype === 'application/pdf') {
    const parsed = await pdfParse(buffer);
    rawText = parsed.text;
  } else {
    // Plain text or markdown
    rawText = buffer.toString('utf-8');
  }

  if (!rawText.trim()) {
    throw new Error('Could not extract any text from the uploaded file.');
  }

  // Insert document record into the database
  const { rows } = await db.query(
    `INSERT INTO documents (filename, mimetype, raw_text, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING id, filename, mimetype, status, created_at`,
    [originalname, mimetype, rawText]
  );

  const document = rows[0];

  // Add ingestion job to the queue
  await ingestQueue.add('ingest', { documentId: document.id });

  console.log(`Document ${document.id} uploaded. Queued for ingestion.`);

  return document;
}

export async function listDocuments() {
  const { rows } = await db.query(
    `SELECT
      id,
      filename,
      mimetype,
      status,
      chunk_count,
      chunks_processed,
      tokens_used,
      error_message,
      created_at
     FROM documents
     ORDER BY created_at DESC`
  );

  return rows;
}

export async function getDocument(id) {
  const { rows } = await db.query(
    `SELECT
      id,
      filename,
      mimetype,
      status,
      chunk_count,
      chunks_processed,
      tokens_used,
      error_message,
      created_at
     FROM documents
     WHERE id = $1`,
    [id]
  );

  if (!rows.length) throw new Error(`Document ${id} not found`);

  return rows[0];
}

export async function getDocumentChunks(id) {
  // Verify document exists first
  await getDocument(id);

  const { rows } = await db.query(
    `SELECT
      id,
      chunk_index,
      content,
      token_count,
      created_at
     FROM chunks
     WHERE document_id = $1
     ORDER BY chunk_index ASC`,
    [id]
  );

  return rows;
}

export async function deleteDocument(id) {
  // Verify document exists first
  await getDocument(id);

  await db.query('DELETE FROM documents WHERE id = $1', [id]);

  // Chunks are deleted automatically via ON DELETE CASCADE

  console.log(`Document ${id} deleted.`);

  return { message: 'Document deleted successfully' };
}