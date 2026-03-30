const STATUS_STYLES = {
  pending:    'bg-gray-100 text-gray-500',
  processing: 'bg-blue-50 text-blue-600',
  ready:      'bg-green-50 text-green-600',
  error:      'bg-red-50 text-red-600',
}

const STATUS_LABELS = {
  pending:    'Pending',
  processing: 'Processing',
  ready:      'Ready',
  error:      'Error',
}

export function ProgressBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {status === 'processing' && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
      )}
      {STATUS_LABELS[status] || status}
    </span>
  )
}