-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table (one row per uploaded file)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  mimetype TEXT NOT NULL,
  raw_text TEXT,
  status TEXT DEFAULT 'pending',
  chunk_count INT DEFAULT 0,
  chunks_processed INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chunks table (many rows per document)
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT,
  embedding vector(384),
  fts tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast approximate nearest-neighbour search
CREATE INDEX ON chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- GIN index for full-text search
CREATE INDEX ON chunks USING gin(fts);

-- Index on document_id for fast chunk lookup
CREATE INDEX ON chunks(document_id);