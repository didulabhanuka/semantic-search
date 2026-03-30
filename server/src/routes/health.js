import { Router } from 'express';
import { db } from '../lib/db.js';
import { redis } from '../lib/redis.js';

const router = Router();

// GET /api/health — check server, db, and redis are alive
router.get('/', async (req, res) => {
  const health = {
    server: 'ok',
    database: 'unknown',
    redis: 'unknown',
    timestamp: new Date().toISOString(),
  };

  try {
    await db.query('SELECT 1');
    health.database = 'ok';
  } catch {
    health.database = 'error';
  }

  try {
    await redis.ping();
    health.redis = 'ok';
  } catch {
    health.redis = 'error';
  }

  const allOk = health.database === 'ok' && health.redis === 'ok';

  res.status(allOk ? 200 : 503).json(health);
});

export default router;
