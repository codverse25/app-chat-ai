import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { ModelSelector } from './ModelSelector';
import type { AIModel } from '../types/chat';

interface HeaderProps {
    selectedModel: AIModel;
    onModelChange: (model: AIModel) => void;
    onMenuToggle: () => void;
}

export function Header({
    selectedModel,
    onModelChange,
    onMenuToggle,
}: HeaderProps) {
    return (
        <header className="glass-strong border-b border-border px-4 md:px-5 py-2.5 md:py-3 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuToggle}
                    className="md:hidden hover:bg-white/10"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* App Name */}
                <h1 className="text-base md:text-lg font-bold gradient-text">
                    Demtimcod AI
                </h1>
            </div>

            {/* Model Selector */}
            <ModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
            />
        </header>
    );
}
