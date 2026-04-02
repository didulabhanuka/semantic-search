import { useState } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  .result-card {
    background: #ffffff;
    border: 1px solid #e8e8e4;
    border-radius: 14px;
    padding: 20px 22px;
    transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
    position: relative;
    overflow: hidden;
  }
  .result-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--card-accent, transparent), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .result-card:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
    border-color: #d4d4cf;
    transform: translateY(-1px);
  }
  .result-card:hover::before {
    opacity: 1;
  }
  .result-card.score-high { --card-accent: #22c55e; }
  .result-card.score-mid  { --card-accent: #f59e0b; }
  .result-card.score-low  { --card-accent: #94a3b8; }

  .rc-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
    gap: 12px;
  }
  .rc-filename {
    font-size: 12.5px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: 0.01em;
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .rc-score-block {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    flex-shrink: 0;
    position: relative;
  }
  .rc-score-label {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.03em;
    cursor: default;
  }
  .score-high .rc-score-label { color: #16a34a; }
  .score-mid  .rc-score-label { color: #d97706; }
  .score-low  .rc-score-label { color: #94a3b8; }

  .rc-tooltip {
    position: absolute;
    right: 0;
    top: calc(100% + 6px);
    width: 220px;
    background: #1c1c1a;
    color: #f5f5f2;
    font-size: 11.5px;
    line-height: 1.55;
    padding: 10px 13px;
    border-radius: 10px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.16s ease, transform 0.16s ease;
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  }
  .rc-tooltip::before {
    content: '';
    position: absolute;
    top: -4px;
    right: 12px;
    width: 8px;
    height: 8px;
    background: #1c1c1a;
    transform: rotate(45deg);
    border-radius: 1px;
  }
  .rc-score-block:hover .rc-tooltip {
    opacity: 1;
    transform: translateY(0);
  }
  .rc-tooltip-title {
    font-weight: 600;
    margin-bottom: 4px;
    color: #ffffff;
  }
  .rc-tooltip-range {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid rgba(255,255,255,0.12);
    color: #9a9a96;
    font-size: 10.5px;
  }

  .rc-bar-track {
    height: 3px;
    background: #f0f0ec;
    border-radius: 99px;
    overflow: hidden;
    margin-bottom: 14px;
  }
  .rc-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .score-high .rc-bar-fill { background: #22c55e; }
  .score-mid  .rc-bar-fill { background: #f59e0b; }
  .score-low  .rc-bar-fill { background: #cbd5e1; }

  .rc-content {
    font-size: 13.5px;
    color: #3d3d38;
    line-height: 1.7;
    letter-spacing: 0.01em;
  }

  .rc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid #f0f0ec;
  }
  .rc-chunk-label {
    font-family: 'DM Mono', monospace;
    font-size: 10.5px;
    color: #b0b0aa;
    letter-spacing: 0.04em;
  }
  .rc-copy-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    color: #b0b0aa;
    background: none;
    border: none;
    cursor: pointer;
    padding: 3px 0;
    transition: color 0.15s;
    font-family: inherit;
  }
  .rc-copy-btn:hover {
    color: #4f46e5;
  }
  .rc-copy-btn.copied {
    color: #16a34a;
  }
  .rc-copy-icon {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`

export function ResultCard({ result }) {
  const [copied, setCopied] = useState(false)

  const pct = Math.round(result.score * 100)
  const scoreClass =
    result.score > 0.7 ? 'score-high' :
    result.score > 0.5 ? 'score-mid' :
    'score-low'

  const tooltipMessage =
    result.score > 0.7
      ? 'Strong semantic match — high confidence this passage answers your query.'
      : result.score > 0.5
      ? 'Good match — this passage is likely relevant to your query.'
      : 'Weak match — this passage may be loosely related.'

  function handleCopy() {
    navigator.clipboard.writeText(result.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <style>{styles}</style>
      <div className={`result-card ${scoreClass}`}>

        <div className="rc-header">
          <span className="rc-filename">{result.document.filename}</span>

          <div className="rc-score-block">
            <span className="rc-score-label">{pct}% match</span>
            <div className="rc-tooltip">
              <div className="rc-tooltip-title">{pct}% Similarity</div>
              <div>{tooltipMessage}</div>
              <div className="rc-tooltip-range">0% = no match · 100% = identical</div>
            </div>
          </div>
        </div>

        <div className="rc-bar-track">
          <div className="rc-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        <p className="rc-content">{result.content}</p>

        <div className="rc-footer">
          <span className="rc-chunk-label">CHUNK {result.chunkIndex + 1}</span>
          <button
            onClick={handleCopy}
            className={`rc-copy-btn ${copied ? 'copied' : ''}`}
            title="Copy passage"
          >
            {copied ? (
              <>
                <svg className="rc-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="rc-copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

      </div>
    </>
  )
}