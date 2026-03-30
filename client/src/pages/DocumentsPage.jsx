import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UploadZone } from '../components/UploadZone.jsx'
import { ProgressBadge } from '../components/ProgressBadge.jsx'
import { uploadDocument, listDocuments, deleteDocument, pollDocument } from '../api/client.js'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    try {
      const data = await listDocuments()
      setDocuments(data.documents)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(file) {
    setUploading(true)
    setError(null)

    try {
      const data = await uploadDocument(file)
      const newDoc = data.document

      // Add to list immediately with pending status
      setDocuments(prev => [newDoc, ...prev])

      // Start polling for status updates
      pollDocument(
        newDoc.id,
        (updated) => {
          setDocuments(prev =>
            prev.map(d => d.id === updated.id ? updated : d)
          )
        },
        (completed) => {
          setDocuments(prev =>
            prev.map(d => d.id === completed.id ? completed : d)
          )
        },
        (errMsg) => setError(errMsg)
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this document and all its chunks?')) return

    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documents</h1>
        <p className="text-sm text-gray-500">Upload and manage your searchable documents</p>
      </div>

      {/* Upload Zone */}
      <div className="mb-8">
        <UploadZone onUpload={handleUpload} uploading={uploading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-3">📄</p>
          <p className="text-sm text-gray-400">No documents yet. Upload one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              {/* Left — filename + meta */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Link
                    to={`/documents/${doc.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate transition-colors"
                  >
                    {doc.filename}
                  </Link>
                  <ProgressBadge status={doc.status} />
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {/* Progress during processing */}
                  {doc.status === 'processing' && doc.chunk_count > 0 && (
                    <span className="text-blue-500">
                      Embedding {doc.chunks_processed} / {doc.chunk_count} chunks...
                    </span>
                  )}

                  {/* Stats when ready */}
                  {doc.status === 'ready' && (
                    <>
                      <span>{doc.chunk_count} chunks</span>
                      <span>·</span>
                      <span>{doc.tokens_used?.toLocaleString()} tokens</span>
                    </>
                  )}

                  {/* Error message */}
                  {doc.status === 'error' && (
                    <span className="text-red-400">{doc.error_message}</span>
                  )}

                  {doc.status === 'pending' && <span>Queued...</span>}
                </div>
              </div>

              {/* Right — delete button */}
              <button
                onClick={() => handleDelete(doc.id)}
                className="ml-4 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="Delete document"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

            </div>
          ))}
        </div>
      )}

    </div>
  )
}