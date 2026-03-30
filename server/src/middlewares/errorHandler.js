export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large. Maximum size is 20MB.',
    });
  }

  // Multer unexpected field error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected file field. Use field name "file".',
    });
  }

  // Known application errors (thrown intentionally in services)
  if (err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });
  }

  if (err.message.includes('Could not extract')) {
    return res.status(422).json({ error: err.message });
  }

  // Fallback for anything unexpected
  res.status(500).json({
    error: 'Internal server error.',
    detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}