import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UploadZone } from '../components/UploadZone.jsx'
import { ProgressBadge } from '../components/ProgressBadge.jsx'
import { uploadDocument, listDocuments, deleteDocument, pollDocument } from '../api/client.js'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [stagedFiles, setStagedFiles] = useState([]) // files waiting for upload
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [pendingTags, setPendingTags] = useState([])
  const [filterTags, setFilterTags] = useState([])
  const [filterInput, setFilterInput] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [filterTags])

  useEffect(() => {
    if (uploading || uploadQueue.length === 0) return
    processNextUpload()
  }, [uploadQueue, uploading])

  async function fetchDocuments() {
    setLoading(true)
    try {
      const data = await listDocuments(filterTags)
      setDocuments(data.documents)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // --- Tag input helpers ---

  function addPendingTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = tagInput.trim().toLowerCase()
    if (tag && !pendingTags.includes(tag)) {
      setPendingTags(prev => [...prev, tag])
    }
    setTagInput('')
  }

  function removePendingTag(tag) {
    setPendingTags(prev => prev.filter(t => t !== tag))
  }

  function addFilterTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = filterInput.trim().toLowerCase()
    if (tag && !filterTags.includes(tag)) {
      setFilterTags(prev => [...prev, tag])
    }
    setFilterInput('')
  }

  function removeFilterTag(tag) {
    setFilterTags(prev => prev.filter(t => t !== tag))
  }

  // --- Staging + Upload ---

  // Called by UploadZone on drop/select — just stages files, doesn't upload yet
  function handleStage(files) {
    setError(null)
    setStagedFiles(prev => {
      // Avoid duplicates by filename
      const existing = new Set(prev.map(f => f.name))
      const newFiles = files.filter(f => !existing.has(f.name))
      return [...prev, ...newFiles]
    })
  }

  function removeStagedFile(name) {
    setStagedFiles(prev => prev.filter(f => f.name !== name))
  }

  // Called by the Upload button — moves staged files into the queue
  function handleUploadClick() {
    if (stagedFiles.length === 0) return
    setUploadQueue(prev => [...prev, ...stagedFiles])
    setStagedFiles([])
    setPendingTags([]) // clear tags after upload starts
    setTagInput('')
  }

  async function processNextUpload() {
    setUploading(true)
    const [file, ...remaining] = uploadQueue
    setUploadQueue(remaining)

    try {
      const data = await uploadDocument(file, pendingTags)
      const newDoc = data.document

      setDocuments(prev => [newDoc, ...prev])

      pollDocument(
        newDoc.id,
        (updated) => setDocuments(prev =>
          prev.map(d => d.id === updated.id ? updated : d)
        ),
        (completed) => setDocuments(prev =>
          prev.map(d => d.id === completed.id ? completed : d)
        ),
        (errMsg) => setError(errMsg)
      )
    } catch (err) {
      setError(`Failed to upload "${file.name}": ${err.message}`)
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

  const allTags = [...new Set(documents.flatMap(d => d.tags || []))]

  return (
    <div className="max-w-3xl mx-auto">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Documents</h1>
        <p className="text-sm text-gray-500">Upload and manage your searchable documents</p>
      </div>

      {/* Upload Zone */}
      <div className="mb-4">
        <UploadZone onUpload={handleStage} uploading={uploading} />
      </div>

      {/* Staged files + tag input + upload button */}
      {stagedFiles.length > 0 && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl px-4 py-4 space-y-4">

          {/* Staged file list */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''} ready to upload
            </p>
            <div className="space-y-1">
              {stagedFiles.map(file => (
                <div
                  key={file.name}
                  className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <button
                    onClick={() => removeStagedFile(file.name)}
                    className="ml-2 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tag input */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-2 block">
              Add tags <span className="text-gray-300">(press Enter or comma to add)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {pendingTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removePendingTag(tag)}
                    className="hover:text-indigo-900"
                  >×</button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addPendingTag}
              placeholder="e.g. ai, research, 2024"
              className="w-full text-sm text-gray-700 placeholder-gray-300 focus:outline-none border-b border-gray-100 pb-1"
            />
          </div>

          {/* Upload button */}
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading
              ? 'Uploading...'
              : `Upload ${stagedFiles.length} file${stagedFiles.length !== 1 ? 's' : ''}${pendingTags.length > 0 ? ` with ${pendingTags.length} tag${pendingTags.length !== 1 ? 's' : ''}` : ''}`
            }
          </button>

        </div>
      )}

      {/* Upload queue indicator */}
      {uploadQueue.length > 0 && (
        <div className="mb-6 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-600">
          {uploading
            ? `Uploading... ${uploadQueue.length} file${uploadQueue.length !== 1 ? 's' : ''} remaining in queue`
            : `${uploadQueue.length} file${uploadQueue.length !== 1 ? 's' : ''} queued`
          }
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filter by tags */}
      {allTags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Filter by tag</span>
            {filterTags.length > 0 && (
              <button
                onClick={() => setFilterTags([])}
                className="text-xs text-gray-300 hover:text-red-400 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (filterTags.includes(tag)) {
                    removeFilterTag(tag)
                  } else {
                    setFilterTags(prev => [...prev, tag])
                  }
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterTags.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={filterInput}
            onChange={e => setFilterInput(e.target.value)}
            onKeyDown={addFilterTag}
            placeholder="Type a tag and press Enter to filter..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      )}

      {/* Document List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 text-gray-300">
          <p className="text-5xl mb-3">📄</p>
          <p className="text-sm text-gray-400">
            {filterTags.length > 0
              ? `No documents tagged with "${filterTags.join(', ')}"`
              : 'No documents yet. Upload one above.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between hover:shadow-sm transition-shadow"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <Link
                    to={`/documents/${doc.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate transition-colors"
                  >
                    {doc.filename}
                  </Link>
                  <ProgressBadge status={doc.status} />
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {doc.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {doc.status === 'processing' && doc.chunk_count > 0 && (
                    <span className="text-blue-500">
                      Embedding {doc.chunks_processed} / {doc.chunk_count} chunks...
                    </span>
                  )}
                  {doc.status === 'ready' && (
                    <>
                      <span>{doc.chunk_count} chunks</span>
                      <span>·</span>
                      <span>{doc.tokens_used?.toLocaleString()} tokens</span>
                    </>
                  )}
                  {doc.status === 'error' && (
                    <span className="text-red-400">{doc.error_message}</span>
                  )}
                  {doc.status === 'pending' && <span>Queued...</span>}
                </div>
              </div>
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