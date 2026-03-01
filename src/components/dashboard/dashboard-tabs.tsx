"use client";

import { useState, useEffect } from "react";

const tabs = [
    { id: "painel", label: "Painel", emoji: "📊" },
    { id: "empresa", label: "Minha Empresa", emoji: "🏢" },
    { id: "clientes", label: "Clientes", emoji: "👥" },
    { id: "financeiro", label: "Financeiro", emoji: "💰" },
    { id: "documentos", label: "Documentos", emoji: "🧾" },
    { id: "obrigacoes", label: "Obrigações", emoji: "📅" },
    { id: "curriculo", label: "Currículo", emoji: "📄" },
    { id: "ferramentas", label: "Ferramentas", emoji: "🛠️" },
];

interface DashboardTabsProps {
    activeTab: string;
    onChange: (id: string) => void;
}

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

    return (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${active
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                            }`}
                    >
                        <span className="text-base">{tab.emoji}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
