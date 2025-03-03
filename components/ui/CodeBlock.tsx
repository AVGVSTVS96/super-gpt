import React, { useEffect, useState } from 'react'
import { highlight } from '@/lib/shiki'

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    highlight(code, language)
      .then(setHtml)
      .catch(console.error)
  }, [code, language])

  return (
    <div className="relative">
      {html ? (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="[&_pre]:!bg-transparent [&_pre]:!p-0"
        />
      ) : (
        <pre className="p-4">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
} 