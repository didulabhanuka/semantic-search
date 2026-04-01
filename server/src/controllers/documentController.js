import {
  uploadDocument,
  listDocuments,
  getDocument,
  getDocumentChunks,
  deleteDocument,
} from '../services/documentService.js';

export async function handleUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Parse tags from request body — sent as comma-separated string
    const rawTags = req.body.tags || '';
    const tags = rawTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const document = await uploadDocument(req.file, tags);

    res.status(202).json({
      message: 'File uploaded. Ingestion started.',
      document,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleList(req, res, next) {
  try {
    // Parse tags filter from query string e.g. ?tags=ai,ml
    const rawTags = req.query.tags || '';
    const tags = rawTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const documents = await listDocuments(tags);
    res.json({ count: documents.length, documents });
  } catch (err) {
    next(err);
  }
}

export async function handleGetOne(req, res, next) {
  try {
    const document = await getDocument(req.params.id);
    res.json({ document });
  } catch (err) {
    next(err);
  }
}

export async function handleGetChunks(req, res, next) {
  try {
    const chunks = await getDocumentChunks(req.params.id);
    res.json({ count: chunks.length, chunks });
  } catch (err) {
    next(err);
  }
}

export async function handleDelete(req, res, next) {
  try {
    const result = await deleteDocument(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}