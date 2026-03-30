import { Router } from 'express';
import documentsRouter from './documents.js';
import searchRouter from './search.js';
import healthRouter from './health.js';

const router = Router();

router.use('/documents', documentsRouter);
router.use('/search', searchRouter);
router.use('/health', healthRouter);

export default router;