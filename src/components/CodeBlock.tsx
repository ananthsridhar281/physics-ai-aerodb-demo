import React from 'react'

interface CodeBlockProps {
  code: string
  language?: string
}

function highlightCode(code: string): React.ReactNode[] {
  const keywords = ['import', 'from', 'as', 'def', 'class', 'return', 'if', 'else', 'elif',
    'for', 'in', 'while', 'True', 'False', 'None', 'not', 'and', 'or', 'with', 'lambda',
    'async', 'await', 'try', 'except', 'finally', 'raise', 'pass', 'break', 'continue']

  const lines = code.split('\n')
  return lines.map((line, lineIdx) => {
    const commentIdx = line.indexOf('#')
    if (commentIdx !== -1) {
      const before = line.slice(0, commentIdx)
      const comment = line.slice(commentIdx)
      return (
        <div key={lineIdx} style={{ minHeight: '1.5em' }}>
          {tokenizeLine(before, keywords, lineIdx * 1000)}
          <span style={{ color: '#6272A4', fontStyle: 'italic' }}>{comment}</span>
          {'\n'}
        </div>
      )
    }
    return (
      <div key={lineIdx} style={{ minHeight: '1.5em' }}>
        {tokenizeLine(line, keywords, lineIdx * 1000)}
        {'\n'}
      </div>
    )
  })
}

function tokenizeLine(text: string, keywords: string[], baseKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"]*"|'[^']*'|\b\d+\.?\d*(?:[eE][+-]?\d+)?\b|\b[a-zA-Z_]\w*\b|[^\w\s]|\s+)/g
  let match: RegExpExecArray | null
  let k = baseKey

  while ((match = regex.exec(text)) !== null) {
    const token = match[0]
    if (keywords.includes(token)) {
      parts.push(<span key={k++} style={{ color: '#FF79C6' }}>{token}</span>)
    } else if (token.startsWith('"') || token.startsWith("'")) {
      parts.push(<span key={k++} style={{ color: '#F1FA8C' }}>{token}</span>)
    } else if (/^\d/.test(token)) {
      parts.push(<span key={k++} style={{ color: '#BD93F9' }}>{token}</span>)
    } else if (/^[A-Z][A-Z0-9_]+$/.test(token)) {
      parts.push(<span key={k++} style={{ color: '#FFB86C' }}>{token}</span>)
    } else if (/^[a-z_]\w*$/.test(token) && keywords.includes(token)) {
      parts.push(<span key={k++} style={{ color: '#FF79C6' }}>{token}</span>)
    } else {
      parts.push(<span key={k++} style={{ color: '#F8F8F2' }}>{token}</span>)
    }
  }
  return parts
}

export default function CodeBlock({ code, language = 'python' }: CodeBlockProps) {
  return (
    <div
      style={{
        backgroundColor: '#0F172A',
        border: '1px solid #1E293B',
        borderRadius: '8px',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', 'Roboto Mono', monospace",
      }}
    >
      {/* macOS title bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          backgroundColor: '#0F172A',
          borderBottom: '1px solid #1E293B',
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F57' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FEBC2E' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#28C840' }} />
        </div>
        <span style={{ fontSize: 10, color: '#475569', fontFamily: 'inherit', letterSpacing: '0.05em' }}>
          {language}
        </span>
      </div>

      {/* Code content */}
      <pre
        style={{
          margin: 0,
          padding: '14px 16px',
          overflowX: 'auto',
          fontSize: 12.5,
          lineHeight: 1.65,
          color: '#F8F8F2',
          fontFamily: 'inherit',
        }}
      >
        {highlightCode(code)}
      </pre>
    </div>
  )
}
