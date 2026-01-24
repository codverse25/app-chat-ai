import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from './button'

interface CodeBlockProps {
    children: string
    className?: string
    inline?: boolean
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    // Ensure children is always a string
    const content = String(children || '')

    // Extract language from className (format: language-xxx)
    const language = className?.replace(/language-/, '') || 'text'

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Inline code (single backtick)
    if (inline) {
        return (
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[13px] border border-zinc-200 dark:border-zinc-700">
                {content}
            </code>
        )
    }

    // Code block (triple backticks)
    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
            {/* Header with language and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                    {language}
                </span>
                <Button
                    size="icon"
                    variant="plain"
                    className="h-7 w-7 opacity-70 hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check size={14} className="text-green-500" />
                    ) : (
                        <Copy size={14} className="text-zinc-500 dark:text-zinc-400" />
                    )}
                </Button>
            </div>

            {/* Code content */}
            <pre className="overflow-x-auto p-4 m-0 bg-white dark:bg-zinc-950">
                <code className="font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 block">
                    {content}
                </code>
            </pre>
        </div>
    )
}
