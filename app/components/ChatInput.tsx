import React from 'react';
import { Send, StopCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
    const [message, setMessage] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message.trim());
            setMessage('');

            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }

            setTimeout(() => {
                textareaRef.current?.focus();
            }, 0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    };

    React.useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    return (
        <div className="glass-strong border-t border-border p-3 md:p-4 rounded-t-md">
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2 sm:gap-3 items-end">
                    <div
                        className={cn(
                            "flex-1 rounded-2xl overflow-hidden transition-all duration-200",
                            "border-2",
                            isFocused
                                ? "border-primary/50 bg-white/8 shadow-[0_0_0_3px_rgba(102,126,234,0.1)]"
                                : "border-white/10 bg-white/5"
                        )}
                    >
                        <Textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Message AI..."
                            disabled={disabled}
                            className="min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] leading-6 focus-visible:ring-0 transition-[height] duration-100 ease-out"
                            rows={1}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={disabled || !message.trim()}
                        size="icon"
                        className={cn(
                            "h-11 w-11 sm:h-[52px] sm:w-[52px] rounded-2xl transition-all duration-200 flex-shrink-0",
                            message.trim() && !disabled
                                ? "bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:scale-105 active:scale-95"
                                : "bg-white/5 opacity-50 scale-95"
                        )}
                    >
                        {disabled ? (
                            <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                    </Button>
                </div>
            </form>

            <div className={cn(
                "max-w-3xl mx-auto mt-2 text-center text-xs text-muted-foreground transition-opacity duration-200 hidden sm:block",
                isFocused ? "opacity-100" : "opacity-70"
            )}>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[11px]">Shift + Enter</kbd> for new line
            </div>
        </div>
    );
}
