import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatMessage } from '../components/ChatMessage';
import { ChatInput } from '../components/ChatInput';
import { InstallPrompt } from '../components/InstallPrompt';
import { storage } from '../utils/storage';
import { sendChatMessage } from '../utils/api';
import type { Conversation, Message, AIModel } from '../types/chat';
import type { Route } from './+types/home';
import { Loader2 } from 'lucide-react';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: 'Demtimcod AI' },
    { name: 'description', content: 'Chat with multiple AI models including GPT-3.5 Turbo, GPT-4o Mini, DeepSeek V3, and DeepSeek R1' },
  ];
}

export default function Home() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<AIModel>('gpt-3.5-turbo');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount with loading state
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Minimum loading time for better UX (prevent flash)
        const [savedConversations, savedModel, savedActiveId] = await Promise.all([
          Promise.resolve(storage.getConversations()),
          Promise.resolve(storage.getSelectedModel()),
          Promise.resolve(storage.getActiveConversationId()),
          new Promise(resolve => setTimeout(resolve, 400)) // 400ms minimum
        ]);

        setConversations(savedConversations);
        setSelectedModel(savedModel);

        // Set active conversation
        if (savedActiveId && savedConversations.find(c => c.id === savedActiveId)) {
          setActiveConversationId(savedActiveId);
        } else if (savedConversations.length > 0) {
          setActiveConversationId(savedConversations[0].id);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadData();
  }, []);

  // Save to localStorage when data changes (skip during initialization)
  React.useEffect(() => {
    if (!isInitializing && conversations.length > 0) {
      storage.saveConversations(conversations);
    }
  }, [conversations, isInitializing]);

  React.useEffect(() => {
    if (!isInitializing) {
      storage.saveSelectedModel(selectedModel);
    }
  }, [selectedModel, isInitializing]);

  React.useEffect(() => {
    if (!isInitializing) {
      storage.saveActiveConversationId(activeConversationId);
    }
  }, [activeConversationId, isInitializing]);

  // Auto-scroll to bottom when messages change (throttled for performance)
  React.useEffect(() => {
    // Use instant scroll during streaming, smooth scroll otherwise
    const behavior = isLoading ? 'instant' : 'smooth';
    messagesEndRef.current?.scrollIntoView({ behavior: behavior as ScrollBehavior });
  }, [conversations, activeConversationId, isLoading]);

  // PWA Install Prompt with better detection
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if user dismissed before
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        // Show prompt after 3 seconds
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    // Listen for install prompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: Check if already installed or installable
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed');
    } else {
      // For browsers that don't fire beforeinstallprompt (like Safari)
      // Check if it's iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isStandalone = (window.navigator as any).standalone;

      if (isIOS && !isStandalone) {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          // Show iOS-specific install prompt
          setTimeout(() => {
            setShowInstallPrompt(true);
          }, 3000);
        }
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS or browsers without beforeinstallprompt
      alert('Untuk install:\n\nChrome/Edge: Klik icon ⊕ di address bar\n\niOS Safari: Tap Share → Add to Home Screen');
      setShowInstallPrompt(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleInstallDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: selectedModel,
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setIsMobileSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);

      // If deleting active conversation, switch to another
      if (id === activeConversationId) {
        const newActive = filtered[0];
        setActiveConversationId(newActive?.id || null);
      }

      // Immediately save to localStorage to prevent data coming back on refresh
      storage.saveConversations(filtered);

      return filtered;
    });
  };

  const handleSendMessage = async (content: string) => {
    // Create new conversation if none exists
    let conversationId = activeConversationId;

    if (!conversationId) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: content.slice(0, 50),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: selectedModel,
      };

      conversationId = newConversation.id;
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(conversationId);
      setIsMobileSidebarOpen(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add user message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: Date.now(),
            title: conv.messages.length === 0 ? content.slice(0, 50) : conv.title,
          }
          : conv
      )
    );

    setIsLoading(true);

    try {
      // Create AI message placeholder
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        model: selectedModel,
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        )
      );

      // Get conversation messages for context
      const conversation = conversations.find(c => c.id === conversationId);
      const messages = conversation?.messages || [];

      // Send to API with streaming
      await sendChatMessage({
        model: selectedModel,
        messages: [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content },
        ],
        onChunk: (chunk) => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === conversationId
                ? {
                  ...conv,
                  messages: conv.messages.map(msg =>
                    msg.id === aiMessageId
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  ),
                }
                : conv
            )
          );
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from AI'}. Please try again.`,
        timestamp: Date.now(),
        model: selectedModel,
      };

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? {
              ...conv,
              messages: [...conv.messages.slice(0, -1), errorMessage],
            }
            : conv
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 flex">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full">
        {/* Header */}
        <Header
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="max-w-5xl mx-auto w-full">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center flex-col gap-6 px-4 sm:px-8 text-center pt-25">
                <div className="flex items-center justify-center">
                  <img src="https://demtimcod.github.io/img/dc-logo.jpg" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
                </div>
                <div>
                  <h2 className="gradient-text text-2xl sm:text-3xl mb-2 font-bold">
                    Welcome to Demtimcod AI
                  </h2>
                  <p className="text-muted-foreground max-w-lg text-sm sm:text-base">
                    Start a conversation with AI. Choose from multiple models including GPT-3.5 Turbo, GPT-4o Mini, DeepSeek V3, and DeepSeek R1.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-6 sm:py-8 md:py-10">
                {activeConversation.messages.map((message, index) => {
                  // Check if this is the last AI message and currently streaming
                  const isLastMessage = index === activeConversation.messages.length - 1;
                  const isStreaming = isLastMessage && message.role === 'assistant' && isLoading;

                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreaming={isStreaming}
                    />
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5">
          <div className="max-w-5xl mx-auto w-full">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt
          onClose={handleInstallDismiss}
          onInstall={handleInstallClick}
        />
      )}
    </div>
  );
}
