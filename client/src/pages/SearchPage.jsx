import { useState, useEffect } from 'react'
import { ResultCard } from '../components/ResultCard.jsx'
import { searchDocuments, streamAnswer } from '../api/client.js'

const HISTORY_KEY = 'semantic_search_history'
const MAX_HISTORY = 10

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function saveHistory(query, existing) {
  const trimmed = [query, ...existing.filter(q => q !== query)].slice(0, MAX_HISTORY)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  return trimmed
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .sp-root {
    max-width: 720px;
    margin: 0 auto;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1a18;
  }

  .sp-hero {
    text-align: center;
    margin-bottom: 36px;
    padding-top: 8px;
  }
  .sp-hero-eyebrow {
    display: inline-block;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #6366f1;
    font-weight: 500;
    margin-bottom: 12px;
    padding: 4px 12px;
    background: #eff0fe;
    border-radius: 999px;
  }
  .sp-hero-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 38px;
    font-weight: 400;
    color: #0f0f0d;
    letter-spacing: -0.02em;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .sp-hero-title em {
    font-style: italic;
    color: #6366f1;
  }
  .sp-hero-sub {
    font-size: 14px;
    color: #9a9a96;
    font-weight: 400;
    max-width: 420px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .sp-search-form {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }
  .sp-search-input {
    flex: 1;
    height: 50px;
    padding: 0 18px;
    border: 1.5px solid #e8e8e4;
    border-radius: 14px;
    font-size: 14px;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1a18;
    background: #ffffff;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    letter-spacing: -0.01em;
  }
  .sp-search-input::placeholder { color: #c0c0ba; }
  .sp-search-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
  }
  .sp-search-btn {
    height: 50px;
    padding: 0 24px;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background 0.15s, transform 0.12s;
    white-space: nowrap;
  }
  .sp-search-btn:hover:not(:disabled) { background: #4338ca; }
  .sp-search-btn:active:not(:disabled) { transform: scale(0.98); }
  .sp-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .sp-history {
    margin-bottom: 32px;
  }
  .sp-history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .sp-history-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b0b0aa;
    font-weight: 500;
  }
  .sp-history-clear {
    font-size: 11.5px;
    color: #c8c8c2;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    padding: 0;
    transition: color 0.15s;
  }
  .sp-history-clear:hover { color: #e11d48; }
  .sp-history-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .sp-history-chip {
    padding: 5px 14px;
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 999px;
    font-size: 12.5px;
    color: #5a5a54;
    cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.1s;
    font-weight: 400;
    letter-spacing: 0.005em;
  }
  .sp-history-chip:hover {
    border-color: #c7c8f5;
    color: #4f46e5;
    background: #f8f8ff;
    transform: translateY(-1px);
  }

  .sp-error {
    padding: 13px 18px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    font-size: 13px;
    color: #e11d48;
    margin-bottom: 20px;
  }

  .sp-results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }
  .sp-results-count {
    font-size: 13px;
    color: #9a9a96;
    font-weight: 400;
  }
  .sp-results-count strong {
    color: #0f0f0d;
    font-weight: 600;
  }
  .sp-ask-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 16px;
    background: #eff0fe;
    color: #4f46e5;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer;
    transition: background 0.15s, transform 0.12s;
    letter-spacing: -0.01em;
  }
  .sp-ask-btn:hover { background: #e0e1fc; transform: translateY(-1px); }
  .sp-ask-btn:active { transform: scale(0.98); }
  .sp-ask-icon {
    font-size: 14px;
    line-height: 1;
  }

  .sp-ai-box {
    background: linear-gradient(135deg, #fafafe 0%, #f4f4ff 100%);
    border: 1px solid #ddd9fb;
    border-radius: 16px;
    padding: 22px 24px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }
  .sp-ai-box::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #8b85f0, #6366f1, #8b85f0);
  }
  .sp-ai-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }
  .sp-ai-dot {
    width: 8px;
    height: 8px;
    background: #6366f1;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .sp-ai-label {
    font-size: 12px;
    font-weight: 700;
    color: #4f46e5;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
  }
  .sp-ai-thinking {
    font-size: 11px;
    color: #9896e8;
    font-family: 'DM Mono', monospace;
    animation: spBlink 1.4s ease-in-out infinite;
  }
  @keyframes spBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.35; }
  }
  .sp-ai-content {
    font-size: 14px;
    color: #2d2d2a;
    line-height: 1.75;
    white-space: pre-wrap;
    letter-spacing: 0.005em;
  }

  .sp-result-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sp-empty {
    text-align: center;
    padding: 80px 0;
  }
  .sp-empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.4; }
  .sp-empty-text { font-size: 13.5px; color: #a8a8a2; }

  .sp-initial {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 0;
    gap: 10px;
  }
  .sp-initial-icon { font-size: 40px; opacity: 0.25; }
  .sp-initial-text { font-size: 13.5px; color: #b8b8b2; }
`

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [answer, setAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [searching, setSearching] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [history, setHistory] = useState(loadHistory)

  async function handleSearch(e, overrideQuery) {
    e?.preventDefault()
    const q = overrideQuery || query
    if (!q.trim()) return
    if (overrideQuery) setQuery(overrideQuery)

    setSearching(true)
    setError(null)
    setResults([])
    setAnswer('')
    setShowAnswer(false)
    setSearched(true)

    try {
      const data = await searchDocuments({ query: q })
      setResults(data.results)
      setHistory(prev => saveHistory(q, prev))
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  function handleAskAI() {
    setShowAnswer(true)
    setAnswer('')
    setStreaming(true)
    streamAnswer(
      query,
      (text) => setAnswer(prev => prev + text),
      () => setStreaming(false),
      (err) => { setError(err); setStreaming(false) }
    )
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  return (
    <>
      <style>{styles}</style>
      <div className="sp-root">

        <div className="sp-hero">
          <span className="sp-hero-eyebrow">Semantic Search</span>
          <h1 className="sp-hero-title">Search your docs,<br /><em>naturally</em></h1>
          <p className="sp-hero-sub">
            Find anything across your documents using natural language — no keywords required.
          </p>
        </div>

        <form onSubmit={handleSearch} className="sp-search-form">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. how does attention mechanism work?"
            className="sp-search-input"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="sp-search-btn"
          >
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>

        {history.length > 0 && (
          <div className="sp-history">
            <div className="sp-history-header">
              <span className="sp-history-label">Recent</span>
              <button className="sp-history-clear" onClick={clearHistory}>Clear</button>
            </div>
            <div className="sp-history-chips">
              {history.map((q, i) => (
                <button key={i} className="sp-history-chip" onClick={() => handleSearch(null, q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <div className="sp-error">{error}</div>}

        {results.length > 0 && (
          <div>
            <div className="sp-results-header">
              <p className="sp-results-count">
                {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                <strong>"{query}"</strong>
              </p>
              {!showAnswer && (
                <button onClick={handleAskAI} className="sp-ask-btn">
                  <span className="sp-ask-icon">✦</span>
                  Ask AI
                </button>
              )}
            </div>

            {showAnswer && (
              <div className="sp-ai-box">
                <div className="sp-ai-header">
                  <div className="sp-ai-dot" />
                  <span className="sp-ai-label">AI Answer</span>
                  {streaming && <span className="sp-ai-thinking">thinking…</span>}
                </div>
                <p className="sp-ai-content">{answer || '\u00a0'}</p>
              </div>
            )}

            <div className="sp-result-list">
              {results.map(result => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </div>
        )}

        {searched && !searching && results.length === 0 && !error && (
          <div className="sp-empty">
            <div className="sp-empty-icon">🔍</div>
            <p className="sp-empty-text">No results found. Try a different query or upload more documents.</p>
          </div>
        )}

        {!searched && (
          <div className="sp-initial">
            <div className="sp-initial-icon">💬</div>
            <p className="sp-initial-text">Upload documents first, then search them here</p>
          </div>
        )}

      </div>
    </>
  )
}