"use client";

import { CnaeTable } from "@/components/cnae/cnae-table";

export function CnaeSection() {
    return (
        <section id="cnaes" className="py-16 sm:py-24 bg-muted/20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-6" /><polyline points="14 2 14 8 20 8" /><path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95z" /></svg>
                        Tabela de CNAEs
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        Atividades <span className="text-primary">Permitidas para MEI</span>
                    </h2>
                    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Pesquise e selecione as atividades que deseja exercer. Você precisa escolher{" "}
                        <strong className="text-foreground">1 atividade principal</strong> e pode adicionar até{" "}
                        <strong className="text-foreground">14 atividades secundárias</strong>.
                    </p>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {[
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 12 2 2 4-4" /><path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" /><path d="M22 19H2" /></svg>
                            ),
                            title: "1 Principal",
                            desc: "A atividade que mais gera receita para o seu negócio.",
                            color: "text-primary",
                            bg: "bg-primary/5 border-primary/20",
                        },
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
                            ),
                            title: "Até 14 Secundárias",
                            desc: "Atividades complementares que também exercerá.",
                            color: "text-foreground",
                            bg: "bg-card border-border",
                        },
                        {
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            ),
                            title: "Atenção",
                            desc: "Nem toda atividade é permitida. Consulte a lista atualizada no Portal.",
                            color: "text-amber-600",
                            bg: "bg-amber-50 border-amber-200",
                        },
                    ].map((item, i) => (
                        <div key={i} className={`rounded-2xl border p-4 flex items-start gap-3 ${item.bg}`}>
                            <div className={`mt-0.5 shrink-0 ${item.color}`}>{item.icon}</div>
                            <div>
                                <p className={`text-sm font-bold ${item.color}`}>{item.title}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* The table */}
                <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
                    <CnaeTable />
                </div>
            </div>
        </section>
    );
}
