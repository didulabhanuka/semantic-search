import { Router } from 'express';
import { upload } from '../middlewares/fileValidator.js';
import {
  handleUpload,
  handleList,
  handleGetOne,
  handleGetChunks,
  handleDelete,
} from '../controllers/documentController.js';

const router = Router();

// POST /api/documents — upload a file
router.post('/', upload.single('file'), handleUpload);

// GET /api/documents — list all documents
router.get('/', handleList);

// GET /api/documents/:id — get one document
router.get('/:id', handleGetOne);

// GET /api/documents/:id/chunks — get all chunks for a document
router.get('/:id/chunks', handleGetChunks);

// DELETE /api/documents/:id — delete a document
router.delete('/:id', handleDelete);

export default router;