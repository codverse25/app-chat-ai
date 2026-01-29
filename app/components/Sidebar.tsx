import React from 'react';
import { Plus, MessageSquare, Trash2, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from './ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';
import { cn } from '../lib/utils';
import type { Conversation } from '../types/chat';

interface SidebarProps {
    conversations: Conversation[];
    activeConversationId: string | null;
    onNewConversation: () => void;
    onSelectConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({
    conversations,
    activeConversationId,
    onNewConversation,
    onSelectConversation,
    onDeleteConversation,
    isMobileOpen,
    onMobileClose,
    isCollapsed,
    onToggleCollapse,
}: SidebarProps) {
    const [hoveredId, setHoveredId] = React.useState<string | null>(null);
    const [isLogoHovered, setIsLogoHovered] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [conversationToDelete, setConversationToDelete] = React.useState<string | null>(null);

    const handleNewChat = () => {
        onNewConversation();
        onMobileClose();
    };

    const handleSelectConversation = (id: string) => {
        onSelectConversation(id);
        onMobileClose();
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setConversationToDelete(id);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (conversationToDelete) {
            onDeleteConversation(conversationToDelete);
            setDeleteDialogOpen(false);
            setConversationToDelete(null);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar - Collapsible on desktop */}
            <aside
                className={cn(
                    "fixed md:static inset-y-0 left-0 z-50 glass-strong border-r border-border flex flex-col transition-all duration-300 ease-in-out",
                    // Mobile: full drawer
                    isMobileOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full",
                    // Desktop: collapsible
                    "md:translate-x-0",
                    isCollapsed ? "md:w-16" : "md:w-60"
                )}
            >
                {/* Logo / Toggle Button - Shows collapse/expand icon on hover */}
                <div className="p-3 border-b border-border">
                    <button
                        onClick={onToggleCollapse}
                        onMouseEnter={() => setIsLogoHovered(true)}
                        onMouseLeave={() => setIsLogoHovered(false)}
                        className="w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isLogoHovered ? (
                            // Show collapse/expand icon on hover
                            isCollapsed ? (
                                <PanelLeft className="w-8 h-8 text-primary" />
                            ) : (
                                <PanelLeftClose className="w-8 h-8 text-primary" />
                            )
                        ) : (
                            // Show logo normally
                            <img
                                src="https://demtimcod.github.io/img/dc-logo.jpg"
                                alt="Logo"
                                className="w-8 h-8 rounded-lg"
                            />
                        )}
                    </button>
                </div>

                {/* New Chat Button */}
                <div className={cn("p-3", isCollapsed && "px-2")}>
                    <Button
                        onClick={handleNewChat}
                        className={cn(
                            "w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30 transition-all",
                            isCollapsed ? "px-2 justify-center" : "justify-start"
                        )}
                        title={isCollapsed ? "New Chat" : undefined}
                    >
                        <Plus className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                        {!isCollapsed && "New Chat"}
                    </Button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                No conversations yet
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                                Start a new chat to begin
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1 pb-4">
                            {conversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredId(conversation.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    <button
                                        onClick={() => handleSelectConversation(conversation.id)}
                                        className={cn(
                                            "w-full text-left rounded-lg transition-all duration-200",
                                            "flex items-center relative",
                                            activeConversationId === conversation.id
                                                ? "bg-white/10 text-foreground"
                                                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                                            isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2.5"
                                        )}
                                        title={isCollapsed ? conversation.title : undefined}
                                    >
                                        <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <span className="flex-1 truncate text-sm pr-8">
                                                {conversation.title}
                                            </span>
                                        )}
                                    </button>

                                    {/* Delete Button - Hidden when collapsed */}
                                    {!isCollapsed && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDeleteClick(e, conversation.id)}
                                            className={cn(
                                                "absolute right-1.5 top-1/2 -translate-y-1/2 transition-all duration-200",
                                                "h-8 w-8 sm:h-7 sm:w-7",
                                                // Desktop: hover to show
                                                "md:opacity-0 md:group-hover:opacity-100",
                                                // Mobile: always visible with red background
                                                "opacity-100 bg-destructive/20 text-destructive",
                                                "hover:bg-destructive/30 active:bg-destructive/40",
                                                "border border-destructive/30"
                                            )}
                                        >
                                            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </aside>

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
