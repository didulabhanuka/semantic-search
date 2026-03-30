import { Router } from 'express';
import {
  handleSearch,
  handleAnswer,
} from '../controllers/searchController.js';

const router = Router();

// POST /api/search — semantic search
router.post('/', handleSearch);

// POST /api/search/answer — RAG answer streamed via SSE
router.post('/answer', handleAnswer);

export default router;