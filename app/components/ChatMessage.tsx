import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import type { Message } from '../types/chat';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ChatMessageProps {
    message: Message;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
    const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
    const [copiedMessage, setCopiedMessage] = React.useState(false);

    const handleCopyCode = (code: string, language: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(language);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(message.content);
        setCopiedMessage(true);
        setTimeout(() => setCopiedMessage(false), 2000);
    };

    const isUser = message.role === 'user';

    return (
        <div
            className={cn(
                "w-full px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6",
                isUser ? "flex justify-end" : "flex justify-start"
            )}
        >
            <div className={cn(
                "max-w-full sm:max-w-[85%] md:max-w-[75%]",
                isUser && "flex flex-col items-end"
            )}>
                {/* Message Content */}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5",
                        isUser
                            ? "bg-primary text-primary-foreground shadow-md" // User: bubble style
                            : "bg-transparent text-foreground" // AI: flat style
                    )}
                >
                    {isUser ? (
                        // User message: simple text
                        <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    ) : (
                        // AI message: markdown with syntax highlighting
                        <div className="prose prose-sm sm:prose-base prose-invert max-w-none">
                            <ReactMarkdown
                                components={{
                                    code({ className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        const code = String(children).replace(/\n$/, '');
                                        const isInline = !className;

                                        return !isInline && language ? (
                                            <div className="relative group my-4">
                                                <div className="flex items-center justify-between bg-zinc-800 px-4 py-2 rounded-t-lg border-b border-zinc-700">
                                                    <span className="text-xs text-zinc-400 font-mono">
                                                        {language}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCopyCode(code, language)}
                                                        className="h-7 px-2 hover:bg-zinc-700"
                                                    >
                                                        {copiedCode === language ? (
                                                            <>
                                                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                                                <span className="text-xs">Copied!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3.5 w-3.5 mr-1.5" />
                                                                <span className="text-xs">Copy</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                                <SyntaxHighlighter
                                                    style={oneDark as any}
                                                    language={language}
                                                    PreTag="div"
                                                    className="!mt-0 !rounded-t-none !rounded-b-lg text-xs sm:text-sm"
                                                >
                                                    {code}
                                                </SyntaxHighlighter>
                                            </div>
                                        ) : (
                                            <code
                                                className="bg-zinc-800 text-zinc-100 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* Copy Button - Only for AI messages when not streaming */}
                {!isUser && !isStreaming && (
                    <div className="mt-2 flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopyMessage}
                            className="h-8 px-3 text-xs hover:bg-white/10 cursor-pointer"
                        >
                            {copiedMessage ? (
                                <>
                                    <Check className="h-3.5 w-3.5 mr-1.5" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
