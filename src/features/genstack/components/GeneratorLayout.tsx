"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { User, CreditCard, Globe, Menu, FileText } from "lucide-react";

export type GeneratorTab = "identity" | "credit-card" | "iban" | "invoice";

interface GeneratorLayoutProps {
    children: React.ReactNode;
    activeTab: GeneratorTab;
    onTabChange: (tab: GeneratorTab) => void;
}

const NAV_ITEMS: { id: GeneratorTab; label: string; icon: React.ElementType }[] = [
    { id: "identity", label: "Identity", icon: User },
    { id: "credit-card", label: "Credit Card", icon: CreditCard },
    { id: "iban", label: "IBAN", icon: Globe },
    { id: "invoice", label: "Invoice", icon: FileText },
];

export default function GeneratorLayout({ children, activeTab, onTabChange }: GeneratorLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-theme(spacing.16))] gap-6">

            {/* Sidebar Navigation (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-2xl border bg-card/30 backdrop-blur-sm p-2 gap-1 sticky top-6 h-fit">
                <div className="px-4 py-3 mb-2">
                    <h2 className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Generator Hub
                    </h2>
                    <p className="text-xs text-muted-foreground">Select a category</p>
                </div>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-left cursor-pointer",
                            activeTab === item.id
                                ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </aside>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center justify-between p-4 rounded-xl border bg-card/50 mb-4">
                <span className="font-bold">Generator Hub</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                    <Menu className="w-5 h-5" />
                </button>
            </div>
            {isMobileMenuOpen && (
                <div className="lg:hidden grid grid-cols-2 gap-2 mb-4 animate-in slide-in-from-top-2">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium cursor-pointer",
                                activeTab === item.id
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-card border-border text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>
        </div>
    );
}
