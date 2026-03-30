import { Worker } from 'bullmq';
import { redis } from '../lib/redis.js';
import { db } from '../lib/db.js';
import { ingestDocument } from '../services/embeddingService.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('Ingest worker started. Waiting for jobs...');

const worker = new Worker(
  'ingest',
  async (job) => {
    const { documentId } = job.data;

    console.log(`Processing job ${job.id} for document ${documentId}`);

    try {
      await ingestDocument(documentId);
    } catch (err) {
      // Mark document as error in the database
      await db.query(
        `UPDATE documents SET status = 'error', error_message = $1 WHERE id = $2`,
        [err.message, documentId]
      );

      console.error(`Job ${job.id} failed:`, err.message);

      // Re-throw so BullMQ knows the job failed and can retry
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 1,
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed after all retries:`, err.message);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});