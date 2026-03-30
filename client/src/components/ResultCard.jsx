export function ResultCard({ result }) {
  const pct = Math.round(result.score * 100)

  const scoreColor =
    result.score > 0.7
      ? 'text-green-600'
      : result.score > 0.5
      ? 'text-amber-600'
      : 'text-slate-400'

  const barColor =
    result.score > 0.7
      ? 'bg-green-500'
      : result.score > 0.5
      ? 'bg-amber-500'
      : 'bg-slate-300'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
          {result.document.filename}
        </span>
        <span className={`text-sm font-semibold ml-2 shrink-0 ${scoreColor}`}>
          {pct}% match
        </span>
      </div>

      {/* Score bar */}
      <div className="h-1 bg-gray-100 rounded-full mb-4">
        <div
          className={`h-1 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Passage text */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {result.content}
      </p>

      {/* Footer */}
      <div className="mt-3 text-xs text-gray-400">
        Chunk {result.chunkIndex + 1}
      </div>

    </div>
  )
}