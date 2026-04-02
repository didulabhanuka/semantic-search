import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UploadZone } from '../components/UploadZone.jsx'
import { ProgressBadge } from '../components/ProgressBadge.jsx'
import { uploadDocument, listDocuments, deleteDocument, pollDocument } from '../api/client.js'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .dp-root {
    max-width: 720px;
    margin: 0 auto;
    font-family: 'DM Sans', system-ui, sans-serif;
    color: #1a1a18;
  }

  .dp-page-title {
    font-size: 28px;
    font-weight: 700;
    color: #0f0f0d;
    letter-spacing: -0.04em;
    margin-bottom: 4px;
  }
  .dp-page-sub {
    font-size: 13.5px;
    color: #9a9a96;
    margin-bottom: 28px;
    font-weight: 400;
  }

  .dp-staged {
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 16px;
    padding: 20px 22px;
    margin-top: 12px;
    margin-bottom: 8px;
  }
  .dp-staged-header {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a8a2;
    margin-bottom: 10px;
    font-weight: 500;
  }
  .dp-staged-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f9f9f7;
    border-radius: 9px;
    margin-bottom: 5px;
  }
  .dp-staged-file:last-child { margin-bottom: 0; }
  .dp-staged-name {
    font-size: 13px;
    color: #3d3d38;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 500px;
  }
  .dp-staged-remove {
    background: none;
    border: none;
    color: #c8c8c2;
    font-size: 18px;
    cursor: pointer;
    padding: 0 2px;
    line-height: 1;
    transition: color 0.15s;
    flex-shrink: 0;
  }
  .dp-staged-remove:hover { color: #e11d48; }

  .dp-divider {
    height: 1px;
    background: #f0f0ec;
    margin: 16px 0;
  }

  .dp-tag-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a8a2;
    font-weight: 500;
    display: block;
    margin-bottom: 8px;
  }
  .dp-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 8px;
  }
  .dp-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    background: #eff0fe;
    color: #4f46e5;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .dp-tag-btn {
    background: none;
    border: none;
    color: #8b85f0;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    padding: 0;
    transition: color 0.12s;
  }
  .dp-tag-btn:hover { color: #4f46e5; }
  .dp-tag-input {
    font-size: 13px;
    color: #1a1a18;
    border: none;
    border-bottom: 1px solid #e8e8e4;
    background: transparent;
    outline: none;
    width: 100%;
    padding-bottom: 6px;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: border-color 0.15s;
  }
  .dp-tag-input::placeholder { color: #c8c8c2; }
  .dp-tag-input:focus { border-color: #6366f1; }

  .dp-upload-btn {
    width: 100%;
    height: 44px;
    margin-top: 16px;
    background: #4f46e5;
    color: #ffffff;
    border: none;
    border-radius: 12px;
    font-size: 13.5px;
    font-weight: 600;
    font-family: 'DM Sans', system-ui, sans-serif;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background 0.15s, transform 0.12s;
  }
  .dp-upload-btn:hover:not(:disabled) { background: #4338ca; }
  .dp-upload-btn:active:not(:disabled) { transform: scale(0.99); }
  .dp-upload-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .dp-queue-notice {
    padding: 12px 16px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    font-size: 13px;
    color: #2563eb;
    margin-bottom: 16px;
    font-weight: 500;
  }
  .dp-error {
    padding: 12px 16px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    border-radius: 12px;
    font-size: 13px;
    color: #e11d48;
    margin-bottom: 16px;
  }

  .dp-filter-section {
    margin-bottom: 24px;
  }
  .dp-filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .dp-filter-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a8a2;
    font-weight: 500;
  }
  .dp-filter-clear {
    font-size: 11.5px;
    color: #c8c8c2;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: color 0.15s;
    padding: 0;
  }
  .dp-filter-clear:hover { color: #e11d48; }
  .dp-filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .dp-filter-tag {
    padding: 4px 14px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    font-family: 'DM Sans', system-ui, sans-serif;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.01em;
  }
  .dp-filter-tag.inactive {
    background: #f4f4f0;
    color: #6a6a64;
  }
  .dp-filter-tag.inactive:hover {
    background: #eff0fe;
    color: #4f46e5;
  }
  .dp-filter-tag.active {
    background: #4f46e5;
    color: #ffffff;
  }
  .dp-filter-input {
    width: 100%;
    height: 38px;
    padding: 0 14px;
    border: 1px solid #e8e8e4;
    border-radius: 10px;
    font-size: 13px;
    color: #1a1a18;
    font-family: 'DM Sans', system-ui, sans-serif;
    outline: none;
    background: #ffffff;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .dp-filter-input::placeholder { color: #c0c0ba; }
  .dp-filter-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }

  .dp-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .dp-doc-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 14px;
    padding: 16px 20px;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .dp-doc-row:hover {
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    border-color: #d4d4cf;
  }
  .dp-doc-info { flex: 1; min-width: 0; }
  .dp-doc-name-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 5px;
  }
  .dp-doc-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #0f0f0d;
    text-decoration: none;
    letter-spacing: -0.01em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.15s;
  }
  .dp-doc-name:hover { color: #4f46e5; }
  .dp-doc-tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }
  .dp-doc-tag {
    padding: 2px 8px;
    background: #f4f4f0;
    color: #7c7c78;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .dp-doc-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #b0b0aa;
    letter-spacing: 0.02em;
  }
  .dp-doc-meta-sep { color: #d8d8d4; }
  .dp-doc-meta.processing { color: #3b82f6; }
  .dp-doc-meta.error { color: #e11d48; }
  .dp-delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #d4d4cf;
    padding: 4px;
    border-radius: 8px;
    transition: color 0.15s, background 0.15s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }
  .dp-delete-btn:hover {
    color: #e11d48;
    background: #fff1f2;
  }
  .dp-delete-icon { width: 15px; height: 15px; }

  .dp-empty {
    text-align: center;
    padding: 80px 0;
  }
  .dp-empty-icon {
    font-size: 44px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
  .dp-empty-text {
    font-size: 13.5px;
    color: #a8a8a2;
    font-weight: 400;
  }
  .dp-loading {
    text-align: center;
    padding: 80px 0;
    font-size: 13.5px;
    color: #c0c0ba;
  }
`

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [stagedFiles, setStagedFiles] = useState([])
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [pendingTags, setPendingTags] = useState([])
  const [filterTags, setFilterTags] = useState([])
  const [filterInput, setFilterInput] = useState('')

  useEffect(() => { fetchDocuments() }, [filterTags])
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

  function addPendingTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = tagInput.trim().toLowerCase()
    if (tag && !pendingTags.includes(tag)) setPendingTags(prev => [...prev, tag])
    setTagInput('')
  }

  function removePendingTag(tag) {
    setPendingTags(prev => prev.filter(t => t !== tag))
  }

  function addFilterTag(e) {
    if (e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    const tag = filterInput.trim().toLowerCase()
    if (tag && !filterTags.includes(tag)) setFilterTags(prev => [...prev, tag])
    setFilterInput('')
  }

  function removeFilterTag(tag) {
    setFilterTags(prev => prev.filter(t => t !== tag))
  }

  function handleStage(files) {
    setError(null)
    setStagedFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      return [...prev, ...files.filter(f => !existing.has(f.name))]
    })
  }

  function removeStagedFile(name) {
    setStagedFiles(prev => prev.filter(f => f.name !== name))
  }

  function handleUploadClick() {
    if (stagedFiles.length === 0) return
    setUploadQueue(prev => [...prev, ...stagedFiles])
    setStagedFiles([])
    setPendingTags([])
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
        (updated) => setDocuments(prev => prev.map(d => d.id === updated.id ? updated : d)),
        (completed) => setDocuments(prev => prev.map(d => d.id === completed.id ? completed : d)),
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
    <>
      <style>{styles}</style>
      <div className="dp-root">

        <h1 className="dp-page-title">Documents</h1>
        <p className="dp-page-sub">Upload and manage your searchable documents</p>

        <UploadZone onUpload={handleStage} uploading={uploading} />

        {stagedFiles.length > 0 && (
          <div className="dp-staged">
            <div className="dp-staged-header">
              {stagedFiles.length} file{stagedFiles.length !== 1 ? 's' : ''} staged
            </div>

            {stagedFiles.map(file => (
              <div key={file.name} className="dp-staged-file">
                <span className="dp-staged-name">{file.name}</span>
                <button className="dp-staged-remove" onClick={() => removeStagedFile(file.name)}>×</button>
              </div>
            ))}

            <div className="dp-divider" />

            <span className="dp-tag-label">
              Add tags <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#c0c0ba' }}>(Enter or comma to add)</span>
            </span>
            {pendingTags.length > 0 && (
              <div className="dp-tags-row">
                {pendingTags.map(tag => (
                  <span key={tag} className="dp-tag">
                    {tag}
                    <button className="dp-tag-btn" onClick={() => removePendingTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addPendingTag}
              placeholder="e.g. ai, research, 2024"
              className="dp-tag-input"
            />

            <button onClick={handleUploadClick} disabled={uploading} className="dp-upload-btn">
              {uploading
                ? 'Uploading…'
                : `Upload ${stagedFiles.length} file${stagedFiles.length !== 1 ? 's' : ''}${pendingTags.length > 0 ? ` · ${pendingTags.length} tag${pendingTags.length !== 1 ? 's' : ''}` : ''}`
              }
            </button>
          </div>
        )}

        {uploadQueue.length > 0 && (
          <div className="dp-queue-notice">
            {uploading
              ? `Uploading… ${uploadQueue.length} file${uploadQueue.length !== 1 ? 's' : ''} remaining`
              : `${uploadQueue.length} file${uploadQueue.length !== 1 ? 's' : ''} queued`
            }
          </div>
        )}

        {error && <div className="dp-error">{error}</div>}

        {allTags.length > 0 && (
          <div className="dp-filter-section">
            <div className="dp-filter-header">
              <span className="dp-filter-label">Filter by tag</span>
              {filterTags.length > 0 && (
                <button className="dp-filter-clear" onClick={() => setFilterTags([])}>Clear filter</button>
              )}
            </div>
            <div className="dp-filter-tags">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`dp-filter-tag ${filterTags.includes(tag) ? 'active' : 'inactive'}`}
                  onClick={() => filterTags.includes(tag) ? removeFilterTag(tag) : setFilterTags(prev => [...prev, tag])}
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
              placeholder="Type a tag and press Enter to filter…"
              className="dp-filter-input"
            />
          </div>
        )}

        {loading ? (
          <div className="dp-loading">Loading…</div>
        ) : documents.length === 0 ? (
          <div className="dp-empty">
            <div className="dp-empty-icon">📄</div>
            <p className="dp-empty-text">
              {filterTags.length > 0
                ? `No documents tagged with "${filterTags.join(', ')}"`
                : 'No documents yet. Upload one above.'
              }
            </p>
          </div>
        ) : (
          <div className="dp-list">
            {documents.map(doc => (
              <div key={doc.id} className="dp-doc-row">
                <div className="dp-doc-info">
                  <div className="dp-doc-name-row">
                    <Link to={`/documents/${doc.id}`} className="dp-doc-name">{doc.filename}</Link>
                    <ProgressBadge status={doc.status} />
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="dp-doc-tags">
                        {doc.tags.map(tag => (
                          <span key={tag} className="dp-doc-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`dp-doc-meta ${doc.status === 'processing' ? 'processing' : doc.status === 'error' ? 'error' : ''}`}>
                    {doc.status === 'processing' && doc.chunk_count > 0 && (
                      <span>Embedding {doc.chunks_processed} / {doc.chunk_count} chunks…</span>
                    )}
                    {doc.status === 'ready' && (
                      <>
                        <span>{doc.chunk_count} chunks</span>
                        <span className="dp-doc-meta-sep">·</span>
                        <span>{doc.tokens_used?.toLocaleString()} tokens</span>
                      </>
                    )}
                    {doc.status === 'error' && <span>{doc.error_message}</span>}
                    {doc.status === 'pending' && <span>Queued…</span>}
                  </div>
                </div>
                <button
                  className="dp-delete-btn"
                  onClick={() => handleDelete(doc.id)}
                  title="Delete document"
                >
                  <svg className="dp-delete-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}