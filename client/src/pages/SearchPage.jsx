import { useState } from 'react'
import { ResultCard } from '../components/ResultCard.jsx'
import { searchDocuments, streamAnswer } from '../api/client.js'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [answer, setAnswer] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [searching, setSearching] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setResults([])
    setAnswer('')
    setShowAnswer(false)
    setSearched(true)

    try {
      const data = await searchDocuments({ query })
      setResults(data.results)
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

  return (
    <div className="max-w-3xl mx-auto">

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Semantic Document Search
        </h1>
        <p className="text-gray-500 text-sm">
          Search your documents using natural language — no keyword matching required
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. how does attention mechanism work?"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">

          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
              <span className="font-medium text-gray-700">"{query}"</span>
            </p>
            {!showAnswer && (
              <button
                onClick={handleAskAI}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <span>✦</span> Ask AI
              </button>
            )}
          </div>

          {/* AI Answer box */}
          {showAnswer && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-indigo-600">✦</span>
                <span className="text-sm font-semibold text-indigo-700">AI Answer</span>
                {streaming && (
                  <span className="text-xs text-indigo-400 animate-pulse">thinking...</span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {answer || ' '}
              </p>
            </div>
          )}

          {/* Result cards */}
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {searched && !searching && results.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">No results found. Try a different query or upload more documents.</p>
        </div>
      )}

      {/* Initial state */}
      {!searched && (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-3">💬</p>
          <p className="text-sm text-gray-400">Upload documents first, then search them here</p>
        </div>
      )}

    </div>
  )
}