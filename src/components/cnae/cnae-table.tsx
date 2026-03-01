"use client";

import { useState, useMemo, useCallback } from "react";
import { CNAES_MEI, CATEGORIES, type Cnae, type Category } from "@/data/cnaes-mei";

const MAX_SECONDARY = 14;

const CategoryColors: Record<string, string> = {
    "Alimentação": "bg-orange-100 text-orange-700 border-orange-200",
    "Beleza e Estética": "bg-pink-100 text-pink-700 border-pink-200",
    "Comércio": "bg-blue-100 text-blue-700 border-blue-200",
    "Construção Civil": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Educação e Informática": "bg-purple-100 text-purple-700 border-purple-200",
    "Indústria e Artesanato": "bg-amber-100 text-amber-700 border-amber-200",
    "Moda e Vestuário": "bg-rose-100 text-rose-700 border-rose-200",
    "Saúde e Bem-Estar": "bg-green-100 text-green-700 border-green-200",
    "Serviços Gerais": "bg-sky-100 text-sky-700 border-sky-200",
    "Transporte": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "Outros": "bg-gray-100 text-gray-600 border-gray-200",
};

export function CnaeTable() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
    const [principal, setPrincipal] = useState<Cnae | null>(null);
    const [secondary, setSecondary] = useState<Cnae[]>([]);
    const [showSelected, setShowSelected] = useState(false);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return CNAES_MEI.filter((c) => {
            const matchesCategory = activeCategory === "Todos" || c.category === activeCategory;
            const matchesSearch =
                !q ||
                c.description.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.category.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory]);

    const handleSelect = useCallback(
        (cnae: Cnae, asPrincipal: boolean) => {
            if (asPrincipal) {
                setPrincipal((prev) => (prev?.code === cnae.code ? null : cnae));
                setSecondary((prev) => prev.filter((s) => s.code !== cnae.code));
                return;
            }
            if (principal?.code === cnae.code) return;
            setSecondary((prev) => {
                const exists = prev.some((s) => s.code === cnae.code);
                if (exists) return prev.filter((s) => s.code !== cnae.code);
                if (prev.length >= MAX_SECONDARY) return prev;
                return [...prev, cnae];
            });
        },
        [principal]
    );

    const totalSelected = (principal ? 1 : 0) + secondary.length;

    const handleClear = () => {
        setPrincipal(null);
        setSecondary([]);
    };

    return (
        <div className="space-y-6">
            {/* Search + filters */}
            <div className="space-y-4">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por atividade ou código CNAE..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none ring-0 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Limpar busca"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveCategory("Todos")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${activeCategory === "Todos"
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                            }`}
                    >
                        Todos
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${activeCategory === cat
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results count + selected summary */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                    atividade{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
                </p>
                {totalSelected > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSelected((v) => !v)}
                            className="text-xs font-semibold text-primary hover:underline"
                        >
                            {showSelected ? "Mostrar todas" : `Ver selecionadas (${totalSelected})`}
                        </button>
                        <span className="text-muted-foreground">·</span>
                        <button
                            onClick={handleClear}
                            className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Limpar seleção
                        </button>
                    </div>
                )}
            </div>


            {/* Table */}
            <div className="rounded-2xl border border-border overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[110px_1fr_140px_auto] gap-x-4 items-center bg-muted/40 border-b border-border px-4 py-2.5">
                    <span className="hidden sm:block text-xs font-bold uppercase tracking-wider text-muted-foreground">Código</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Atividade</span>
                    <span className="hidden sm:block text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoria</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Ação</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border/50 max-h-[520px] overflow-y-auto">
                    {(showSelected
                        ? [...(principal ? [principal] : []), ...secondary]
                        : filtered
                    ).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <div>
                                <p className="font-semibold text-sm">Nenhuma atividade encontrada</p>
                                <p className="text-xs mt-1">Tente outro termo de busca ou categoria</p>
                            </div>
                        </div>
                    ) : (
                        (showSelected
                            ? [...(principal ? [principal] : []), ...secondary]
                            : filtered
                        ).map((cnae) => {
                            const isPrincipal = principal?.code === cnae.code;
                            const isSecondary = secondary.some((s) => s.code === cnae.code);
                            const isAnySelected = isPrincipal || isSecondary;
                            const isDisabled = !isAnySelected && !isPrincipal && secondary.length >= MAX_SECONDARY && !isSecondary;

                            return (
                                <div
                                    key={cnae.code}
                                    className={`grid grid-cols-[1fr_auto] sm:grid-cols-[110px_1fr_140px_auto] gap-x-4 items-center px-4 py-3 transition-colors ${isPrincipal
                                        ? "bg-primary/[0.04]"
                                        : isSecondary
                                            ? "bg-muted/20"
                                            : "hover:bg-accent/30"
                                        }`}
                                >
                                    {/* Code */}
                                    <span className="hidden sm:block text-xs font-mono font-semibold text-muted-foreground">{cnae.code}</span>

                                    {/* Description */}
                                    <div>
                                        <p className={`text-sm ${isAnySelected ? "font-medium" : ""}`}>{cnae.description}</p>
                                        <p className="sm:hidden text-xs font-mono text-muted-foreground mt-0.5">{cnae.code}</p>
                                        {isPrincipal && (
                                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-2 py-0.5">
                                                Principal
                                            </span>
                                        )}
                                        {isSecondary && (
                                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                                                Secundário
                                            </span>
                                        )}
                                    </div>

                                    {/* Category badge */}
                                    <div className="hidden sm:flex">
                                        <span
                                            className={`inline-block rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${CategoryColors[cnae.category] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                                        >
                                            {cnae.category}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-end gap-1.5">
                                        <button
                                            onClick={() => handleSelect(cnae, true)}
                                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition-all whitespace-nowrap ${isPrincipal
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                                                }`}
                                        >
                                            {isPrincipal ? "✓ Principal" : "Principal"}
                                        </button>
                                        <button
                                            onClick={() => handleSelect(cnae, false)}
                                            disabled={isDisabled}
                                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold border transition-all whitespace-nowrap ${isSecondary
                                                ? "bg-muted text-foreground border-border"
                                                : isDisabled
                                                    ? "opacity-30 cursor-not-allowed bg-card text-muted-foreground border-border"
                                                    : isPrincipal
                                                        ? "opacity-30 cursor-not-allowed bg-card text-muted-foreground border-border"
                                                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
                                                }`}
                                        >
                                            {isSecondary ? "✓ Secundário" : "Secundário"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {secondary.length >= MAX_SECONDARY && (
                    <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 text-xs font-medium text-amber-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                        Limite máximo de {MAX_SECONDARY} atividades secundárias atingido.
                    </div>
                )}
            </div>

            {/* Selection summary panel */}
            {totalSelected > 0 && (
                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 6 9 17l-5-5" /></svg>
                        <h4 className="text-sm font-bold text-primary">CNAEs Selecionados</h4>
                    </div>

                    {principal && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Principal</p>
                            <div className="flex items-center justify-between gap-2 rounded-xl bg-card border border-primary/20 px-3 py-2">
                                <div>
                                    <span className="text-xs font-mono font-bold text-primary">{principal.code}</span>
                                    <p className="text-sm font-medium mt-0.5">{principal.description}</p>
                                </div>
                                <button
                                    onClick={() => setPrincipal(null)}
                                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Remover principal"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {secondary.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                Secundários ({secondary.length}/{MAX_SECONDARY})
                            </p>
                            <div className="space-y-1.5">
                                {secondary.map((c) => (
                                    <div key={c.code} className="flex items-center justify-between gap-2 rounded-xl bg-card border border-border/60 px-3 py-2">
                                        <div>
                                            <span className="text-xs font-mono font-semibold text-muted-foreground">{c.code}</span>
                                            <p className="text-sm">{c.description}</p>
                                        </div>
                                        <button
                                            onClick={() => setSecondary((prev) => prev.filter((s) => s.code !== c.code))}
                                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                                            aria-label={`Remover ${c.code}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Help text */}
            <p className="text-xs text-muted-foreground leading-relaxed text-center px-4">
                ⚠️ Esta lista é uma referência educacional. Verifique os CNAEs atualizados diretamente no{" "}
                <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    Portal do Empreendedor
                </a>
                {" "}antes de formalizar.
            </p>
        </div>
    );
}
