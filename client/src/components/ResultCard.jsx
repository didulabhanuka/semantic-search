import { useState } from 'react'

export function ResultCard({ result }) {
  const [copied, setCopied] = useState(false)

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

  // Tooltip message based on score
  const scoreTooltip =
    result.score > 0.7
      ? 'Strong semantic match — high confidence this passage answers your query.'
      : result.score > 0.5
      ? 'Good semantic match — this passage is likely relevant to your query.'
      : 'Weak semantic match — this passage may be loosely related to your query.'

  function handleCopy() {
    navigator.clipboard.writeText(result.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
          {result.document.filename}
        </span>

        {/* Score badge with tooltip */}
        <div className="relative group ml-2 shrink-0">
          <span className={`text-sm font-semibold cursor-help ${scoreColor}`}>
            {pct}% match
          </span>

          {/* Tooltip */}
          <div className="
            absolute right-0 top-6 z-10 w-64 px-3 py-2
            bg-gray-900 text-white text-xs rounded-lg
            opacity-0 group-hover:opacity-100
            transition-opacity pointer-events-none
            shadow-lg
          ">
            <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 rotate-45" />
            <p className="font-semibold mb-1">{pct}% Similarity Score</p>
            <p className="text-gray-300 leading-relaxed">{scoreTooltip}</p>
            <p className="text-gray-400 mt-1">
              Score range: 0% = no match · 100% = identical
            </p>
          </div>
        </div>
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

      {/* Footer — chunk index + copy button */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          Chunk {result.chunkIndex + 1}
        </span>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
          title="Copy passage text"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

    </div>
  )
}