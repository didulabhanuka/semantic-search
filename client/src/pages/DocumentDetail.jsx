import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ProgressBadge } from '../components/ProgressBadge.jsx'
import { ResultCard } from '../components/ResultCard.jsx'
import { getDocument, getDocumentChunks, searchDocuments } from '../api/client.js'

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
      const data = await searchDocuments({
        query,
        documentIds: [id],
      })
      setResults(data.results)
      setActiveTab('results')
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  if (loading) {
    return <div className="text-center py-16 text-sm text-gray-400">Loading...</div>
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Back link */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        ← Back to Documents
      </Link>

      {/* Document Header */}
      <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">
              {document.filename}
            </h1>
            <ProgressBadge status={document.status} />
          </div>
        </div>

        {/* Stats */}
        {document.status === 'ready' && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Chunks</p>
              <p className="text-lg font-semibold text-gray-900">{document.chunk_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Tokens used</p>
              <p className="text-lg font-semibold text-gray-900">
                {document.tokens_used?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Uploaded</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(document.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Per-document search */}
      {document.status === 'ready' && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search within this document..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            type="submit"
            disabled={searching || !query.trim()}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setActiveTab('chunks')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'chunks'
              ? 'bg-indigo-50 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Chunks ({chunks.length})
        </button>
        {results.length > 0 && (
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'results'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Results ({results.length})
          </button>
        )}
      </div>

      {/* Chunks tab */}
      {activeTab === 'chunks' && (
        <div className="space-y-3">
          {chunks.map(chunk => (
            <div
              key={chunk.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">
                  Chunk {chunk.chunk_index + 1}
                </span>
                <span className="text-xs text-gray-300">
                  ~{chunk.token_count} tokens
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Results tab */}
      {activeTab === 'results' && (
        <div className="space-y-3">
          {results.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}

    </div>
  )
}