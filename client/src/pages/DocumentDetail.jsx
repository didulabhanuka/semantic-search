import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProgressBadge } from '../components/ProgressBadge.jsx'
import { ResultCard } from '../components/ResultCard.jsx'
import { getDocument, getDocumentChunks, searchDocuments } from '../api/client.js'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .dd-root {
    max-width: 720px;
    margin: 0 auto;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1a18;
  }

  .dd-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: #a0a09a;
    text-decoration: none;
    margin-bottom: 28px;
    letter-spacing: 0.01em;
    transition: color 0.15s;
  }
  .dd-back:hover { color: #4f46e5; }
  .dd-back-arrow {
    width: 14px;
    height: 14px;
    transition: transform 0.15s;
  }
  .dd-back:hover .dd-back-arrow { transform: translateX(-2px); }

  .dd-header {
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 18px;
    padding: 26px 28px;
    margin-bottom: 20px;
  }
  .dd-header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 6px;
  }
  .dd-filename {
    font-size: 18px;
    font-weight: 600;
    color: #0f0f0d;
    letter-spacing: -0.02em;
    line-height: 1.3;
    word-break: break-word;
  }
  .dd-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-top: 22px;
    padding-top: 20px;
    border-top: 1px solid #f0f0ec;
  }
  .dd-stat {
    padding: 0 20px;
    border-right: 1px solid #f0f0ec;
  }
  .dd-stat:first-child { padding-left: 0; }
  .dd-stat:last-child { border-right: none; }
  .dd-stat-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b0b0aa;
    margin-bottom: 6px;
  }
  .dd-stat-value {
    font-size: 22px;
    font-weight: 600;
    color: #0f0f0d;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .dd-stat-value.text-sm {
    font-size: 14px;
    letter-spacing: -0.01em;
    color: #3d3d38;
  }

  .dd-search-form {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }
  .dd-search-input {
    flex: 1;
    height: 44px;
    padding: 0 16px;
    border: 1px solid #e8e8e4;
    border-radius: 12px;
    font-size: 13.5px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1a18;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .dd-search-input::placeholder { color: #c0c0ba; }
  .dd-search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
  .dd-search-btn {
    height: 44px;
    padding: 0 20px;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
    white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .dd-search-btn:hover:not(:disabled) { background: #4338ca; }
  .dd-search-btn:active:not(:disabled) { transform: scale(0.98); }
  .dd-search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .dd-tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 16px;
    background: #f5f5f1;
    border-radius: 12px;
    padding: 3px;
    width: fit-content;
  }
  .dd-tab {
    padding: 6px 16px;
    border-radius: 10px;
    font-size: 12.5px;
    font-weight: 500;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, box-shadow 0.15s;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #7c7c78;
    letter-spacing: 0.01em;
  }
  .dd-tab:hover { color: #3d3d38; }
  .dd-tab.active {
    background: #ffffff;
    color: #0f0f0d;
    box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.06);
  }

  .dd-chunk {
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 14px;
    padding: 18px 22px;
    margin-bottom: 10px;
    transition: border-color 0.15s;
  }
  .dd-chunk:hover { border-color: #d0d0ca; }
  .dd-chunk-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .dd-chunk-index {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    font-weight: 500;
    color: #6366f1;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .dd-chunk-tokens {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: #c8c8c2;
    letter-spacing: 0.04em;
  }
  .dd-chunk-content {
    font-size: 13px;
    color: #3d3d38;
    line-height: 1.72;
    letter-spacing: 0.005em;
  }

  .dd-state {
    text-align: center;
    padding: 72px 0;
    color: #c8c8c2;
    font-size: 13.5px;
  }
  .dd-error {
    padding: 14px 18px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    font-size: 13px;
    color: #e11d48;
    margin-bottom: 20px;
  }
`

export default function DocumentDetail() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [chunks, setChunks] = useState([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('chunks')

  useEffect(() => {
    async function load() {
      try {
        const [docData, chunksData] = await Promise.all([
          getDocument(id),
          getDocumentChunks(id),
        ])
        setDocument(docData.document)
        setChunks(chunksData.chunks)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const data = await searchDocuments({ query, documentIds: [id] })
      setResults(data.results)
      setActiveTab('results')
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="dd-root"><div className="dd-state">Loading…</div></div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <style>{styles}</style>
        <div className="dd-root"><div className="dd-error">{error}</div></div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="dd-root">

        <Link to="/documents" className="dd-back">
          <svg className="dd-back-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Documents
        </Link>

        <div className="dd-header">
          <div className="dd-header-top">
            <h1 className="dd-filename">{document.filename}</h1>
            <ProgressBadge status={document.status} />
          </div>

          {document.status === 'ready' && (
            <div className="dd-stats">
              <div className="dd-stat">
                <div className="dd-stat-label">Chunks</div>
                <div className="dd-stat-value">{document.chunk_count}</div>
              </div>
              <div className="dd-stat">
                <div className="dd-stat-label">Tokens used</div>
                <div className="dd-stat-value">{document.tokens_used?.toLocaleString()}</div>
              </div>
              <div className="dd-stat">
                <div className="dd-stat-label">Uploaded</div>
                <div className="dd-stat-value text-sm">
                  {new Date(document.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {document.status === 'ready' && (
          <form onSubmit={handleSearch} className="dd-search-form">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search within this document…"
              className="dd-search-input"
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="dd-search-btn"
            >
              {searching ? 'Searching…' : 'Search'}
            </button>
          </form>
        )}

        <div className="dd-tabs">
          <button
            className={`dd-tab ${activeTab === 'chunks' ? 'active' : ''}`}
            onClick={() => setActiveTab('chunks')}
          >
            Chunks ({chunks.length})
          </button>
          {results.length > 0 && (
            <button
              className={`dd-tab ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Results ({results.length})
            </button>
          )}
        </div>

        {activeTab === 'chunks' && (
          <div>
            {chunks.map(chunk => (
              <div key={chunk.id} className="dd-chunk">
                <div className="dd-chunk-meta">
                  <span className="dd-chunk-index">Chunk {chunk.chunk_index + 1}</span>
                  <span className="dd-chunk-tokens">~{chunk.token_count} tokens</span>
                </div>
                <p className="dd-chunk-content">{chunk.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'results' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map(result => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}

      </div>
    </>
  )
}