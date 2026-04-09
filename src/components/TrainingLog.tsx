import React, { useEffect, useRef, useState } from 'react'

interface TrainingLogProps {
  lines: string[]
  delayMs?: number
  onComplete?: () => void
  accentColor?: string
}

export default function TrainingLog({
  lines,
  delayMs = 280,
  onComplete,
  accentColor = '#7C3AED',
}: TrainingLogProps) {
  const [visible, setVisible] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    setVisible([])

    let i = 0
    const tick = () => {
      if (doneRef.current) return
      if (i < lines.length) {
        const idx = i
        setVisible(prev => [...prev, lines[idx]])
        i++
        setTimeout(tick, delayMs + (Math.random() * 80 - 40))
      } else {
        onComplete?.()
      }
    }
    const t = setTimeout(tick, 100)
    return () => {
      doneRef.current = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.join('|'), delayMs])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visible])

  function lineColor(line: string): string {
    if (line.includes('Error') || line.includes('failed') || line.includes('FAILED')) return '#EF4444'
    if (line.includes('complete') || line.includes('Complete') || line.includes('created') || line.includes('saved')) return '#10B981'
    if (line.includes('Epoch') || line.includes('Loss') || line.includes('Status')) return accentColor
    if (line.includes('Submitting') || line.includes('Connecting') || line.includes('Found') || line.includes('Building')) return '#0891B2'
    return '#94A3B8'
  }

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: '#0B0F1A',
        border: '1px solid #1E293B',
        borderRadius: '8px',
        padding: '12px 14px',
        maxHeight: '300px',
        overflowY: 'auto',
        fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
        fontSize: 12,
        lineHeight: 1.75,
      }}
    >
      {visible.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#334155', userSelect: 'none', flexShrink: 0 }}>›</span>
          <span style={{ color: lineColor(line) }}>{line}</span>
        </div>
      ))}
      {visible.length < lines.length && (
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ color: '#334155' }}>›</span>
          <span style={{ color: accentColor }} className="cursor-blink">_</span>
        </div>
      )}
    </div>
  )
}
