import { useRef, useEffect, useState } from 'react'
import { Send, Trash2, Plus, MessageSquare, Menu, Bot, Sparkles, BrainCircuit, Box, Globe, Paperclip, Cpu, X } from 'lucide-react'
import { Button } from '@/components/selia/button'

import {
    Select,
    SelectTrigger,
    SelectPopup,
    SelectList,
    SelectItem,
} from '@/components/selia/select'
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogPopup,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogClose,
} from '@/components/selia/alert-dialog'
import { Toast, toastManager } from '@/components/selia/toast'
import { MessageBubble } from '@/components/selia/MessageBubble'
import { useChat, type Model } from '@/lib/useChat'
import { cn } from '@/lib/utils'

function App() {
    const {
        conversations,
        currentChatId,
        currentConversation,
        createNewChat,
        deleteChat,
        setModel,
        isLoading,
        sendMessage,
        setCurrentChatId
    } = useChat()

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-create chat if none exists
    useEffect(() => {
        if (conversations.length === 0 && !currentChatId) {
            createNewChat()
        }
    }, [conversations, currentChatId, createNewChat])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [currentConversation?.messages])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const input = form.elements.namedItem('message') as HTMLTextAreaElement
        if (input.value.trim()) {
            sendMessage(input.value)
            input.value = ''
            // Reset textarea height
            input.style.height = 'auto'
        }
    }

    const handleDeleteChat = (id: string) => {
        deleteChat(id)
        toastManager.add({
            type: 'success',
            title: 'Conversation deleted',
            description: 'The conversation has been successfully removed.',
            timeout: 3000
        })
    }

    const handleCreateNewChat = () => {
        createNewChat()
    }

    return (
        <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-50 overflow-hidden">
            <Toast />
            {/* Sidebar - Desktop */}
            <aside className="hidden h-full w-72 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex flex-shrink-0">
                <SidebarContent
                    conversations={conversations}
                    currentChatId={currentChatId}
                    onCreateNew={handleCreateNewChat}
                    onSelectChat={(id) => setCurrentChatId(id)}
                    onDeleteChat={handleDeleteChat}
                />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="relative flex h-full w-4/5 max-w-xs flex-col bg-white dark:bg-zinc-900 shadow-xl animate-in slide-in-from-left duration-300">
                        <SidebarContent
                            conversations={conversations}
                            currentChatId={currentChatId}
                            onCreateNew={() => {
                                handleCreateNewChat()
                                setIsMobileMenuOpen(false)
                            }}
                            onSelectChat={(id) => {
                                setCurrentChatId(id)
                                setIsMobileMenuOpen(false)
                            }}
                            onDeleteChat={handleDeleteChat}
                            onClose={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 flex-col h-full overflow-hidden relative">
                {/* Mobile Header */}
                <header className="flex h-14 items-center justify-between px-4 border-b border-zinc-200 bg-white md:hidden dark:border-zinc-800 dark:bg-zinc-900 flex-shrink-0">
                    <Button size="icon" variant="plain" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu size={20} />
                    </Button>
                    <span className="font-semibold truncate max-w-[60%]">
                        {currentConversation && currentConversation.messages.length > 0
                            ? currentConversation.title
                            : 'Demtimcod AI'}
                    </span>
                    <Button size="icon" variant="plain" onClick={handleCreateNewChat}>
                        <Plus size={20} />
                    </Button>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex h-16 items-center justify-between px-6 border-b border-zinc-200 bg-white/50 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50 flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-lg">
                            {currentConversation && currentConversation.messages.length > 0
                                ? currentConversation.title
                                : 'Demtimcod AI Chat'}
                        </span>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-50/50 dark:bg-zinc-950 scroll-smooth">
                    <div className="mx-auto max-w-3xl space-y-6 pb-4">
                        {!currentConversation || currentConversation.messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <div className="mb-4 rounded-full bg-indigo-100 p-4 text-indigo-500 dark:bg-indigo-900/30">
                                    <Sparkles size={32} />
                                </div>
                                <h2 className="text-xl font-medium">How can I help you?</h2>
                                <p className="text-sm text-zinc-500">Pick a model and start a new conversation.</p>
                            </div>
                        ) : (
                            currentConversation?.messages?.map((msg, i) => (
                                <MessageBubble key={i} role={msg.role} content={msg.content} />
                            ))
                        )}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-1 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 delay-0"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 delay-150"></span>
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 delay-300"></span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="flex-shrink-0 bg-white p-4 dark:bg-zinc-900 pb-8">
                    <div className="mx-auto max-w-3xl">
                        <form
                            onSubmit={handleSubmit}
                            className="relative flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-sm focus-within:ring-1 focus-within:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:ring-zinc-700 transition-all"
                        >
                            <div className="min-h-[60px] p-4">
                                <textarea
                                    name="message"
                                    placeholder="Ask anything. Type @ for mentions and / for shortcuts."
                                    className="w-full resize-none border-none bg-transparent p-0 placeholder:text-zinc-400 focus:outline-none focus:ring-0 text-lg max-h-[200px] overflow-y-auto"
                                    rows={1}
                                    onInput={(e) => {
                                        const target = e.currentTarget;
                                        target.style.height = 'auto';
                                        target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            e.currentTarget.form?.requestSubmit();
                                        }
                                    }}
                                    disabled={isLoading || !currentChatId}
                                />
                            </div>

                            <div className="flex items-center justify-between p-2 pl-4">
                                {/* Left Tools */}
                                <div className="flex items-center gap-1 rounded-xl bg-zinc-50 p-1 dark:bg-zinc-800/50">
                                    <Button type="button" size="icon" variant="plain" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                        <Select
                                            value={currentConversation?.model || 'gpt-3.5-turbo'}
                                            onValueChange={(val: any) => setModel(val.value as Model)}
                                        >
                                            <SelectTrigger className="w-8 h-8 p-0 border-none bg-transparent shadow-none ring-0 focus:ring-0 justify-center">
                                                <Cpu size={20} />
                                            </SelectTrigger>
                                            <SelectPopup
                                                align="start"
                                                side="top"
                                                sideOffset={10}
                                                className="min-w-[180px] sm:min-w-[220px]" // ← Tambah ini
                                            >
                                                <SelectList>
                                                    <SelectItem value="gpt-3.5-turbo">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                                                            <Bot size={12} className="text-green-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                                                            <span className="truncate text-xs sm:text-sm">GPT-3.5 Turbo</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="gpt-4o-mini">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                                                            <Sparkles size={12} className="text-indigo-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                                                            <span className="truncate text-xs sm:text-sm">GPT-4o Mini</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="deepseek-v3">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                                                            <BrainCircuit size={12} className="text-blue-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                                                            <span className="truncate text-xs sm:text-sm">DeepSeek V3</span>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="deepseek-r1">
                                                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
                                                            <Box size={12} className="text-purple-500 flex-shrink-0 sm:w-3.5 sm:h-3.5" />
                                                            <span className="truncate text-xs sm:text-sm">DeepSeek R1</span>
                                                        </div>
                                                    </SelectItem>
                                                </SelectList>
                                            </SelectPopup>
                                        </Select>
                                    </Button>
                                </div>

                                {/* Right Tools */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Button type="button" size="icon" variant="plain" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                            <Globe size={18} />
                                        </Button>
                                        <Button type="button" size="icon" variant="plain" className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                            <Paperclip size={18} />
                                        </Button>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-9 w-9 bg-indigo-700 text-white hover:bg-indigo-800 rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95"
                                        disabled={isLoading || !currentChatId}
                                    >
                                        {isLoading ? (
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
                                        ) : (
                                            <Send size={18} />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </form>
                        <div className="mt-2 text-center text-[10px] text-zinc-400">
                            Using {currentConversation?.model || 'AI Model'}. AI can make mistakes.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}


function SidebarContent({
    conversations,
    currentChatId,
    onCreateNew,
    onSelectChat,
    onDeleteChat,
    onClose
}: {
    conversations: any[],
    currentChatId: string | null,
    onCreateNew: () => void,
    onSelectChat: (id: string) => void,
    onDeleteChat: (id: string) => void,
    onClose?: () => void
}) {
    return (
        <>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2 font-semibold">
                    {onClose && (
                        <Button size="icon" variant="plain" className="h-8 w-8 mr-1 -ml-2 text-zinc-500" onClick={onClose}>
                            <X size={20} />
                        </Button>
                    )}
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white overflow-hidden">
                        <img src='https://demtimcod.github.io/img/dc-logo.jpg' alt='logo demtimcod' className='w-full h-full object-cover' />
                    </div>
                    <span>Demtimcod AI</span>
                </div>
                <Button size="icon" variant="plain" className="h-8 w-8" onClick={onCreateNew}>
                    <Plus size={18} />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {conversations.map((chat: any) => (
                    <div
                        key={chat.id}
                        onClick={() => onSelectChat(chat.id)}
                        className={cn(
                            "group flex items-center gap-3 px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors relative",
                            currentChatId === chat.id
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        )}
                    >
                        <MessageSquare size={16} className={currentChatId === chat.id ? "text-indigo-500" : "text-zinc-400"} />
                        <div className="flex-1 truncate pr-6">
                            {chat.title}
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                            <AlertDialog>
                                <AlertDialogTrigger
                                    render={(triggerProps) => (
                                        <Button
                                            {...triggerProps}
                                            size="icon"
                                            variant="plain"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    )}
                                />
                                <AlertDialogPopup>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-zinc-500">
                                            This will permanently delete this conversation. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogClose>Cancel</AlertDialogClose>
                                        <AlertDialogClose render={(props) => (
                                            <Button
                                                variant="danger"
                                                {...props}
                                                onClick={(e) => {
                                                    onDeleteChat(chat.id);
                                                    if (props.onClick) {
                                                        props.onClick(e);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        )} />
                                    </AlertDialogFooter>
                                </AlertDialogPopup>
                            </AlertDialog>
                        </div>
                    </div>
                ))}
                {conversations.length === 0 && (
                    <div className="text-center py-10 text-xs text-zinc-400">
                        No conversations yet.
                    </div>
                )}
            </div>
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>API Connected</span>
                </div>
            </div>
        </>
    )
}

export default App
