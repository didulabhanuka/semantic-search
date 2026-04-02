const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    dot: false,
    className: 'badge-pending',
  },
  processing: {
    label: 'Processing',
    dot: true,
    className: 'badge-processing',
  },
  ready: {
    label: 'Ready',
    dot: false,
    className: 'badge-ready',
  },
  error: {
    label: 'Error',
    dot: false,
    className: 'badge-error',
  },
}

const styles = `
  .progress-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-family: 'DM Mono', 'Fira Mono', 'Courier New', monospace;
  }
  .badge-pending {
    background: #f1f1ef;
    color: #7c7c78;
    border: 1px solid #e2e2de;
  }
  .badge-processing {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }
  .badge-ready {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }
  .badge-error {
    background: #fff1f2;
    color: #e11d48;
    border: 1px solid #fecdd3;
  }
  .badge-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
    animation: badgePulse 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes badgePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.75); }
  }
`

export function ProgressBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <>
      <style>{styles}</style>
      <span className={`progress-badge ${config.className}`}>
        {config.dot && <span className="badge-dot" />}
        {config.label}
      </span>
    </>
  )
}