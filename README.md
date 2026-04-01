# SemanticSearch

> A full-stack semantic document search engine built with React, Node.js, and PostgreSQL. Upload documents, search them with natural language — no keyword matching required.

![Stack](https://img.shields.io/badge/stack-React%20%C2%B7%20Node.js%20%C2%B7%20PostgreSQL-6366f1)
![Embeddings](https://img.shields.io/badge/embeddings-all--MiniLM--L6--v2%20(local)-10b981)
![Vector DB](https://img.shields.io/badge/vector%20db-pgvector%20HNSW-3b82f6)
![License](https://img.shields.io/badge/license-MIT-gray)

---

## What is this?

SemanticSearch is a **RAG (Retrieval-Augmented Generation) pipeline** — the same architecture used in production by Notion AI, Intercom, and most enterprise search products.

You upload PDF, TXT, or Markdown files. The system chunks each document, generates vector embeddings using a **locally-running AI model** (no OpenAI required), and stores them in PostgreSQL using the `pgvector` extension. A search interface lets you type natural-language questions and receive ranked passages from your documents — even when the query shares zero keywords with the source text.

```
Query: "how do neural networks adjust during training"
Found: "...the network adjusts its weights through a process called backpropagation..."
                                                        ↑ 46% semantic match, zero keywords shared
```

---

## Features

- **Semantic search** — finds relevant passages based on meaning, not keywords
- **Hybrid search** — blends vector cosine similarity (70%) with PostgreSQL full-text rank (30%)
- **Local embeddings** — runs `all-MiniLM-L6-v2` locally via `@xenova/transformers`, no API key needed
- **AI answers** — streams Claude-powered answers from top-ranked passages (optional)
- **Demo mode** — fully functional AI answers without an Anthropic API key
- **Async ingestion** — BullMQ worker handles chunking and embedding in the background
- **Live progress** — real-time chunk progress during document ingestion
- **Multi-file upload** — drag and drop multiple files, staged before uploading
- **Document tags** — tag documents on upload, filter by tag in the document list
- **Search history** — recent queries saved locally, clickable to re-run
- **Copy button** — copy any result passage to clipboard with one click
- **Score tooltips** — hover over match % to understand what the score means
- **Per-document search** — search within a single document from its detail page
- **Chunk browser** — inspect exactly how your document was split and embedded
- **Redis caching** — search results cached for 10 minutes

---

## Architecture

### Two Pipelines

```
INGEST   Upload → Parse → Chunk → Embed (local model) → Store in pgvector
          runs once per document, async via BullMQ worker

QUERY    Embed query → ANN search (HNSW) → Re-rank → Return results
          runs on every search, target latency < 500ms
```

### Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind v4 | Fast dev, minimal config |
| API | Express.js | Familiar, minimal boilerplate |
| Queue | BullMQ + Redis | Retries, concurrency, progress events |
| Embeddings | `@xenova/transformers` (`all-MiniLM-L6-v2`) | Free, local, 384 dims, great recall |
| Vector DB | PostgreSQL + pgvector | No extra infra, HNSW index ~40ms search |
| AI answers | Claude API (`claude-sonnet-4-6`) | Optional, streams via SSE |
| PDF parsing | `pdf-parse` | Simple, no native deps |

### Folder Structure

```
semantic-search/
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js          # Central router
│   │   │   ├── documents.js      # Upload, list, delete
│   │   │   ├── search.js         # Search + RAG answer
│   │   │   └── health.js         # Health check
│   │   ├── controllers/
│   │   │   ├── documentController.js
│   │   │   └── searchController.js
│   │   ├── services/
│   │   │   ├── documentService.js   # Upload, parse, queue
│   │   │   ├── embeddingService.js  # Chunk + embed pipeline
│   │   │   └── searchService.js     # Vector + hybrid search, RAG
│   │   ├── lib/
│   │   │   ├── db.js             # pg Pool singleton
│   │   │   ├── redis.js          # ioredis + BullMQ queue
│   │   │   ├── chunker.js        # Sentence-boundary chunking
│   │   │   └── embeddings.js     # Local model singleton
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js
│   │   │   └── fileValidator.js
│   │   ├── workers/
│   │   │   └── ingestWorker.js   # BullMQ worker
│   │   └── app.js
│   ├── migrations/
│   │   ├── 001_init.sql          # Schema + pgvector indexes
│   │   └── 002_add_tags.sql      # Tags column
│   └── package.json
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── SearchPage.jsx
    │   │   ├── DocumentsPage.jsx
    │   │   └── DocumentDetail.jsx
    │   ├── components/
    │   │   ├── ResultCard.jsx     # Score bar, tooltip, copy button
    │   │   ├── UploadZone.jsx     # Drag and drop, multi-file
    │   │   └── ProgressBadge.jsx  # Status indicator
    │   └── api/
    │       └── client.js          # Fetch wrappers + SSE stream reader
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 16+ with [pgvector](https://github.com/pgvector/pgvector) extension installed
- Redis (or [Memurai](https://www.memurai.com/) on Windows)

### 1. Clone and install

```bash
git clone https://github.com/didulabhanuka/semantic-search.git
cd semantic-search
```

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set up the database

```bash
psql -U postgres -c "CREATE DATABASE docsearch;"
psql -U postgres -d docsearch -f server/migrations/001_init.sql
psql -U postgres -d docsearch -f server/migrations/002_add_tags.sql
```

### 3. Configure environment

Create `server/.env`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/docsearch
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=your_key_here   # Optional — app works without it
PORT=3000
```

> If `ANTHROPIC_API_KEY` is not set or invalid, the app automatically falls into **Demo Mode** — AI answers are generated locally from the top matching passages with a typewriter effect. No functionality is lost.

### 4. Run the app

Open three terminals:

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — Ingest worker
cd server && npm run worker

# Terminal 3 — React client
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Verify everything is healthy

```
GET http://localhost:3000/api/health
```

Expected response:
```json
{
  "server": "ok",
  "database": "ok",
  "redis": "ok",
  "timestamp": "..."
}
```

---

## How It Works

### Ingestion Pipeline

1. **Upload** — File received via multipart POST, text extracted (`pdf-parse` for PDFs, UTF-8 decode for text/markdown)
2. **Queue** — Document inserted into PostgreSQL with `status: pending`, job added to BullMQ
3. **Chunk** — Worker splits raw text at sentence boundaries with 512-token max and 50-token overlap
4. **Embed** — Each chunk passed through `all-MiniLM-L6-v2` locally, producing a 384-dim vector
5. **Store** — Chunk + embedding inserted into `chunks` table, `chunks_processed` incremented for live progress
6. **Ready** — Document status updated to `ready`, available for search

### Search Pipeline

1. **Embed query** — Query string passed through the same local model (must match ingestion model)
2. **ANN search** — pgvector HNSW index finds approximate nearest neighbours using cosine distance (`<=>`)
3. **Hybrid rank** — Score blended: `0.7 × vector_similarity + 0.3 × ts_rank` (full-text)
4. **Filter** — Results below 0.3 score threshold dropped
5. **Cache** — Results cached in Redis for 10 minutes (keyed by MD5 hash of all search params)
6. **Return** — Ranked passages with scores, chunk index, and source filename

### Chunking Strategy

```
"Chunk at sentence boundaries, not character count."
```

Splitting mid-sentence makes embeddings less coherent. The 50-token overlap preserves context at chunk edges so a query spanning two chunks still finds the right passage.

### Why HNSW over IVFFlat?

HNSW builds incrementally — rows are inserted one at a time without rebuilding the index. IVFFlat requires a full `ANALYZE` pass after bulk loading and degrades on small datasets. Always use HNSW unless you have millions of vectors.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/documents` | Upload a file (`multipart/form-data`, field: `file`, optional: `tags`) |
| `GET` | `/api/documents` | List all documents (optional: `?tags=ai,research`) |
| `GET` | `/api/documents/:id` | Get document status and metadata |
| `GET` | `/api/documents/:id/chunks` | Get all chunks for a document |
| `DELETE` | `/api/documents/:id` | Delete document and all its chunks |
| `POST` | `/api/search` | Search: `{ query, limit?, documentIds?, hybrid? }` |
| `POST` | `/api/search/answer` | RAG answer — streams SSE: `{ query }` |
| `GET` | `/api/health` | Health check for server, DB, and Redis |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Redis connection string |
| `ANTHROPIC_API_KEY` | No | Claude API key — falls back to demo mode if missing |
| `PORT` | No | API server port (default: 3000) |

---

## Key Design Decisions

**Local embeddings over OpenAI** — `all-MiniLM-L6-v2` runs entirely on your machine. Zero cost, zero API latency, works offline. The model downloads once (~80MB) and caches locally. Dimension count is 384 vs 1536 for OpenAI's `text-embedding-3-small` — smaller but more than sufficient for document search.

**PostgreSQL over a dedicated vector DB** — pgvector means no extra infrastructure. Your vectors live alongside your relational data with full ACID compliance, JOINs, point-in-time recovery, and everything else Postgres gives you.

**Hybrid search** — Pure vector search misses exact keyword matches. Pure full-text search misses semantic intent. The 70/30 blend handles both `"how does attention work"` (semantic) and `"BERT 2018 paper"` (keyword) style queries.

**Worker as a separate process** — The ingest worker runs independently of the API server. You can scale workers without scaling the API, restart one without affecting the other, and add `concurrency: N` in one line.

**Staged uploads** — Files are held in a staging area before uploading so users can add tags and review the file list before committing. This prevents accidental uploads and ensures tags are always applied correctly.

---

## Scripts

```bash
# Server
npm run dev      # Start API with nodemon (auto-restart)
npm run start    # Start API (production)
npm run worker   # Start ingest worker with nodemon

# Client
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## License

MIT
