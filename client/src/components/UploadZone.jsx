import { useState, useRef } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  .upload-zone {
    border: 1.5px dashed #d4d4cf;
    border-radius: 16px;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
    background: #fafaf8;
    position: relative;
    overflow: hidden;
  }
  .upload-zone::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(79,70,229,0.04) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.25s;
    pointer-events: none;
  }
  .upload-zone:hover:not(.upload-zone--disabled),
  .upload-zone--dragging {
    border-color: #6366f1;
    background: #f8f8ff;
    box-shadow: 0 0 0 4px rgba(99,102,241,0.07);
  }
  .upload-zone:hover::after,
  .upload-zone--dragging::after {
    opacity: 1;
  }
  .upload-zone--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .upload-zone--dragging {
    border-style: solid;
    border-color: #6366f1;
  }

  .uz-icon-wrap {
    width: 52px;
    height: 52px;
    margin: 0 auto 18px;
    border-radius: 14px;
    background: #efeffd;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .upload-zone:hover:not(.upload-zone--disabled) .uz-icon-wrap,
  .upload-zone--dragging .uz-icon-wrap {
    transform: translateY(-2px) scale(1.05);
    background: #e0e0fb;
  }
  .uz-icon {
    width: 24px;
    height: 24px;
    color: #6366f1;
    transition: color 0.2s;
  }

  .uz-title {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a18;
    margin-bottom: 5px;
    letter-spacing: -0.01em;
  }
  .uz-title span {
    color: #6366f1;
    text-decoration: underline;
    text-underline-offset: 2px;
    text-decoration-thickness: 1px;
  }
  .uz-subtitle {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #a8a8a2;
    letter-spacing: 0.02em;
  }

  .uz-uploading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 13.5px;
    color: #6366f1;
    font-weight: 500;
  }
  .uz-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #e0e0fb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: uzSpin 0.7s linear infinite;
    flex-shrink: 0;
  }
  @keyframes uzSpin {
    to { transform: rotate(360deg); }
  }
`

export function UploadZone({ onUpload, uploading }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (uploading) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onUpload(files)
  }

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length) onUpload(files)
    e.target.value = ''
  }

  const zoneClass = [
    'upload-zone',
    dragging ? 'upload-zone--dragging' : '',
    uploading ? 'upload-zone--disabled' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <style>{styles}</style>
      <div
        className={zoneClass}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md"
          multiple
          style={{ display: 'none' }}
          onChange={handleChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="uz-uploading">
            <div className="uz-spinner" />
            Uploading…
          </div>
        ) : (
          <>
            <div className="uz-icon-wrap">
              <svg className="uz-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="uz-title">
              Drop files here or <span>browse</span>
            </p>
            <p className="uz-subtitle">PDF · TXT · MARKDOWN — UP TO 20MB · MULTI-FILE</p>
          </>
        )}
      </div>
    </>
  )
}