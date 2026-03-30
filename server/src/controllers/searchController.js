import { semanticSearch, ragAnswer } from '../services/searchService.js';

export async function handleSearch(req, res, next) {
  try {
    const { query, limit = 10, documentIds = [], hybrid = true } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    if (typeof limit !== 'number' || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Limit must be a number between 1 and 50.' });
    }

    const results = await semanticSearch(query, { limit, documentIds, hybrid });

    res.json({
      query,
      count: results.length,
      results,
    });
  } catch (err) {
    next(err);
  }
}

export async function handleAnswer(req, res, next) {
  try {
    const { query } = req.body;

    if (!query?.trim()) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    // Set SSE headers before streaming starts
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    await ragAnswer(query, res);
  } catch (err) {
    next(err);
  }
}