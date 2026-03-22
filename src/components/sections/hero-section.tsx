"use client";

import { useState } from "react";

const areas = [
    {
        href: "/jornada",
        emoji: "🚀",
        title: "Jornada de Abertura",
        description: "Passo a passo interativo para abrir seu MEI do zero.",
        color: "from-primary/10 to-primary/5 border-primary/20 hover:border-primary/40 hover:shadow-primary/10",
        titleColor: "text-primary",
    },
    {
        href: "/cnaes",
        emoji: "📋",
        title: "Tabela de CNAEs",
        description: "Pesquise e selecione suas atividades permitidas pelo MEI.",
        color: "from-blue-50 to-blue-50/50 border-blue-200 hover:border-blue-300 hover:shadow-blue-100",
        titleColor: "text-blue-700",
    },
    {
        href: "/o-que-e-mei",
        emoji: "💡",
        title: "O que é MEI?",
        description: "Vantagens, limitações e regras importantes do MEI.",
        color: "from-amber-50 to-amber-50/50 border-amber-200 hover:border-amber-300 hover:shadow-amber-100",
        titleColor: "text-amber-700",
    },
    {
        href: "/sites-uteis",
        emoji: "🔗",
        title: "Sites Úteis",
        description: "Links oficiais e ferramentas essenciais para o MEI.",
        color: "from-violet-50 to-violet-50/50 border-violet-200 hover:border-violet-300 hover:shadow-violet-100",
        titleColor: "text-violet-700",
    },
    {
        href: "/ja-sou-mei",
        emoji: "🏢",
        title: "Já sou MEI",
        description: "Dashboard completo: finanças, documentos, clientes e mais.",
        color: "from-emerald-50 to-emerald-50/50 border-emerald-200 hover:border-emerald-300 hover:shadow-emerald-100",
        titleColor: "text-emerald-700",
    },
    {
        href: "/cursos",
        emoji: "🎓",
        title: "Cursos e Treinamento",
        description: "Cursos gratuitos do SEBRAE, FGV e mais para se capacitar.",
        color: "from-rose-50 to-rose-50/50 border-rose-200 hover:border-rose-300 hover:shadow-rose-100",
        titleColor: "text-rose-700",
    },
];

export function HeroSection() {
    const [showQuero, setShowQuero] = useState(false);

    return (
        <section className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-mei-gold/10 blur-3xl" />
                <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
                {/* Hero text */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        Guia completo e gratuito
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        Seu portal{" "}
                        <span className="text-primary">MEI</span>
                        <br />
                        <span className="text-muted-foreground font-medium">
                            completo e interativo.
                        </span>
                    </h1>

                    <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Tudo que você precisa para abrir, gerenciar e manter seu
                        Microempreendedor Individual em um só lugar.
                    </p>

                    {/* Stats */}
                    <div className="mt-6 flex justify-center gap-8 sm:gap-12">
                        {[
                            { value: "5", label: "Passos simples" },
                            { value: "R$0", label: "Para abrir" },
                            { value: "~15min", label: "Tempo médio" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-xl sm:text-2xl font-bold text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation cards */}
                <div className="max-w-4xl mx-auto space-y-4">
                    {!showQuero ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setShowQuero(true)}
                                className="group relative rounded-2xl border bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200 p-6 sm:p-8 text-left transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 hover:shadow-blue-100"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    🚀
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-blue-700">
                                    Quero ser MEI
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    O que é, Tabela de CNAEs permitidos e a Jornada completa
                                    para abrir seu negócio simplificado.
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Ver opções
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </div>
                            </button>

                            <a
                                href="/ja-sou-mei"
                                className="group relative rounded-2xl border bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200 p-6 sm:p-8 text-left transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300 hover:shadow-emerald-100"
                            >
                                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                    🏢
                                </div>
                                <h3 className="font-bold text-xl mb-2 text-emerald-700">
                                    Já sou MEI
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Acesse seu dashboard completo: emissão de notas, finanças,
                                    documentos, clientes e obrigações.
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    Acessar painel
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                </div>
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                                    <span className="text-2xl">🚀</span> Quero ser MEI
                                </h3>
                                <button
                                    onClick={() => setShowQuero(false)}
                                    className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                    Voltar
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {areas.filter(a => ["/o-que-e-mei", "/jornada", "/cnaes"].includes(a.href)).map((area) => (
                                    <a
                                        key={area.href}
                                        href={area.href}
                                        className={`group relative rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${area.color}`}
                                    >
                                        <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                            {area.emoji}
                                        </div>
                                        <h3 className={`font-bold text-base mb-1 ${area.titleColor}`}>
                                            {area.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {area.description}
                                        </p>
                                        <div className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold ${area.titleColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                            Acessar
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Secondary Layout for Sites Uteis and Cursos */}
                    <div className="pt-4 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4">
                        {areas.filter(a => ["/sites-uteis", "/cursos"].includes(a.href)).map((area) => (
                            <a
                                key={area.href}
                                href={area.href}
                                className="flex items-center gap-2.5 rounded-full border border-border bg-card/50 px-4 py-2 transition-all duration-300 hover:shadow-sm hover:bg-card hover:-translate-y-0.5 group"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform">{area.emoji}</span>
                                <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                    {area.title}
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
