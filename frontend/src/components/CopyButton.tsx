import { useState } from 'react'

export default function CopyButton({ text, style }: { text: string; style?: React.CSSProperties }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={copy}
      className={`copy-btn ${copied ? 'copied' : ''}`}
      style={style}
    >
      {copied ? '✓ COPIED' : 'COPY'}
    </button>
  )
}
