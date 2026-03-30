import { IORedis } from 'ioredis';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

export const redis = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export const ingestQueue = new Queue('ingest', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});