import React from 'react'
import { Lock, Play, RotateCcw, CheckCircle } from 'lucide-react'

interface CellContainerProps {
  cellIndex: number
  title: string
  description?: string
  isLocked: boolean
  onRun: () => void
  children: React.ReactNode
  completionMessage?: string
  cellState: 'idle' | 'running' | 'complete'
  accentColor?: string
}

export default function CellContainer({
  cellIndex,
  title,
  description,
  isLocked,
  onRun,
  children,
  completionMessage,
  cellState,
  accentColor = '#2563EB',
}: CellContainerProps) {
  const running = cellState === 'running'
  const complete = cellState === 'complete'

  const handleRun = () => {
    if (isLocked || running) return
    onRun()
  }

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-300 ${
        isLocked ? 'opacity-50 border-slate-200' :
        complete ? 'border-emerald-200 shadow-sm' :
        'border-slate-200 shadow-sm'
      }`}
      style={{ marginBottom: '1.5rem' }}
    >
      {/* Cell header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
        {/* Cell number badge */}
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {cellIndex}
        </div>

        {/* Title area */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-slate-900 text-sm">{title}</span>
          {description && (
            <span className="ml-2 text-slate-400 text-xs hidden sm:inline">{description}</span>
          )}
        </div>

        {/* Complete badge */}
        {complete && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full">
            <CheckCircle size={12} />
            <span>Complete</span>
          </div>
        )}

        {/* Run button or lock indicator */}
        {isLocked ? (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Lock size={13} />
            <span>Run previous cell first</span>
          </div>
        ) : (
          <button
            onClick={handleRun}
            disabled={running}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              running
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : complete
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                : 'text-white hover:opacity-90 active:scale-95'
            }`}
            style={!running && !complete ? { backgroundColor: accentColor } : {}}
          >
            {running ? (
              <>
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Running…
              </>
            ) : complete ? (
              <>
                <RotateCcw size={12} />
                Re-run
              </>
            ) : (
              <>
                <Play size={12} />
                Run
              </>
            )}
          </button>
        )}
      </div>

      {/* Cell body */}
      <div className="p-5">
        {children}
      </div>

      {/* Completion banner */}
      {complete && completionMessage && (
        <div className="mx-5 mb-5 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium px-4 py-2.5 rounded-lg">
          <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
          <span>{completionMessage}</span>
        </div>
      )}
    </div>
  )
}
