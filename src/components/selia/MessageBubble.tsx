import { lazy, Suspense } from 'react'
import { cn } from "@/lib/utils"
import { CodeBlock } from './CodeBlock'

// Lazy load react-markdown
const Markdown = lazy(() => import('react-markdown'))

interface MessageBubbleProps {
    role: "user" | "assistant" | "system"
    content: string
    className?: string
}

export function MessageBubble({ role, content, className }: MessageBubbleProps) {
    const isUser = role === "user"

    // Ensure content is always a string
    const safeContent = String(content || '')

    // Don't render if content is empty
    if (!safeContent.trim()) {
        return null
    }

    return (
        <div
            className={cn(
                "flex w-full",
                isUser ? "justify-end" : "justify-start",
                className
            )}
        >
            <div
                className={cn(
                    "relative max-w-[85%] px-5 py-3.5 text-sm shadow-md",
                    isUser
                        ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-sm"
                        : "bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-sm shadow-sm"
                )}
            >
                <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-[15px] overflow-hidden">
                    <Suspense fallback={<div className="animate-pulse whitespace-pre-wrap break-words">{safeContent}</div>}>
                        <Markdown
                            components={{
                                code(props: any) {
                                    const { className, children } = props
                                    const inline = 'inline' in props ? props.inline : false
                                    const codeContent = String(children).replace(/\n$/, '')
                                    return (
                                        <CodeBlock
                                            inline={inline}
                                            className={className}
                                        >
                                            {codeContent}
                                        </CodeBlock>
                                    )
                                },
                                p(props: any) {
                                    return <p className="break-words overflow-wrap-anywhere mb-3 last:mb-0">{props.children}</p>
                                },
                                a(props: any) {
                                    return (
                                        <a
                                            href={props.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                                        >
                                            {props.children}
                                        </a>
                                    )
                                },
                                ul(props: any) {
                                    return <ul className="list-disc list-inside space-y-1 my-3">{props.children}</ul>
                                },
                                ol(props: any) {
                                    return <ol className="list-decimal list-inside space-y-1 my-3">{props.children}</ol>
                                },
                                li(props: any) {
                                    return <li className="break-words">{props.children}</li>
                                },
                                blockquote(props: any) {
                                    return (
                                        <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 italic my-3 text-zinc-600 dark:text-zinc-400">
                                            {props.children}
                                        </blockquote>
                                    )
                                },
                                h1(props: any) {
                                    return <h1 className="text-xl font-bold mt-4 mb-2 break-words">{props.children}</h1>
                                },
                                h2(props: any) {
                                    return <h2 className="text-lg font-bold mt-3 mb-2 break-words">{props.children}</h2>
                                },
                                h3(props: any) {
                                    return <h3 className="text-base font-bold mt-3 mb-2 break-words">{props.children}</h3>
                                },
                            }}
                        >
                            {safeContent}
                        </Markdown>
                    </Suspense>
                </div>
            </div>
        </div>
    )
}