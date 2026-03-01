"use client";

import { useFinanceiroStore } from "@/store/financeiro-store";
import { useEmpresaStore } from "@/store/empresa-store";
import { useState, useEffect, useMemo } from "react";

const LIMITE_ANUAL = 81000;

function KpiCard({ emoji, label, value, sub, color }: {
    emoji: string; label: string; value: string; sub?: string; color: string;
}) {
    return (
        <div className={`rounded-2xl border p-5 ${color}`}>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{emoji}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
    );
}

export function Painel() {
    const transacoes = useFinanceiroStore((s) => s.transacoes);
    const empresa = useEmpresaStore((s) => s.empresa);
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const stats = useMemo(() => {
        const yearTx = transacoes.filter((t) => t.data.startsWith(String(currentYear)));
        const monthTx = transacoes.filter((t) => {
            const d = new Date(t.data);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        const receitaAnual = yearTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
        const despesaAnual = yearTx.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
        const receitaMensal = monthTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
        const despesaMensal = monthTx.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
        const lucroMensal = receitaMensal - despesaMensal;
        const nClientes = new Set(monthTx.filter((t) => t.tipo === "receita" && t.cliente).map((t) => t.cliente)).size;
        const ticketMedio = nClientes > 0 ? receitaMensal / nClientes : 0;

        return { receitaAnual, despesaAnual, receitaMensal, despesaMensal, lucroMensal, nClientes, ticketMedio };
    }, [transacoes, currentYear, currentMonth]);

    const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const pctFaturamento = Math.min((stats.receitaAnual / LIMITE_ANUAL) * 100, 100);

    const dasValue = empresa.tipoAtividade === "comercio" ? 75.90 : empresa.tipoAtividade === "servico" ? 79.90 : 80.90;

    const mesesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const monthlyData = useMemo(() => {
        return mesesLabels.map((_, idx) => {
            const monthTx = transacoes.filter((t) => {
                const d = new Date(t.data);
                return d.getFullYear() === currentYear && d.getMonth() === idx;
            });
            const receita = monthTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
            const despesa = monthTx.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
            return { receita, despesa };
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transacoes, currentYear]);

    const maxChart = Math.max(...monthlyData.map((d) => Math.max(d.receita, d.despesa)), 1);

    if (!mounted) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-28 rounded-2xl bg-muted" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">Painel de Controle</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Visão geral do seu negócio em {currentYear}.
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard emoji="💵" label="Receita Mensal" value={fmt(stats.receitaMensal)} color="border-primary/20 bg-primary/5" />
                <KpiCard emoji="📉" label="Despesas Mês" value={fmt(stats.despesaMensal)} color="border-red-200 bg-red-50" />
                <KpiCard emoji="✨" label="Lucro Mensal" value={fmt(stats.lucroMensal)} sub={stats.lucroMensal >= 0 ? "Positivo" : "Negativo"} color={stats.lucroMensal >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"} />
                <KpiCard emoji="🎯" label="Ticket Médio" value={stats.nClientes > 0 ? fmt(stats.ticketMedio) : "—"} sub={`${stats.nClientes} cliente${stats.nClientes !== 1 ? "s" : ""} no mês`} color="border-blue-200 bg-blue-50" />
            </div>

            {/* Faturamento anual */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <span className="text-base">📊</span> Faturamento Anual {currentYear}
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${pctFaturamento >= 90 ? "bg-red-100 text-red-700" :
                        pctFaturamento >= 70 ? "bg-amber-100 text-amber-700" :
                            "bg-emerald-100 text-emerald-700"
                        }`}>
                        {pctFaturamento.toFixed(1)}%
                    </span>
                </div>
                <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${pctFaturamento >= 90 ? "bg-red-500" :
                            pctFaturamento >= 70 ? "bg-amber-500" :
                                "bg-primary"
                            }`}
                        style={{ width: `${pctFaturamento}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{fmt(stats.receitaAnual)} faturados</span>
                    <span>Limite: {fmt(LIMITE_ANUAL)}</span>
                </div>
                {pctFaturamento >= 80 && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 font-medium">
                        ⚠️ Atenção! Você está próximo do limite anual de faturamento. Considere avaliar a migração para ME.
                    </div>
                )}
            </div>

            {/* Chart - Simple bar chart */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">📈</span> Receitas × Despesas ({currentYear})
                </h3>
                <div className="flex items-end gap-1.5 h-40">
                    {monthlyData.map((d, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${mesesLabels[idx]}: Receita ${fmt(d.receita)} | Despesa ${fmt(d.despesa)}`}>
                            <div className="w-full flex gap-0.5 items-end h-32">
                                <div
                                    className="flex-1 rounded-t bg-primary/70 transition-all duration-500 min-h-[2px]"
                                    style={{ height: `${(d.receita / maxChart) * 100}%` }}
                                />
                                <div
                                    className="flex-1 rounded-t bg-red-400/70 transition-all duration-500 min-h-[2px]"
                                    style={{ height: `${(d.despesa / maxChart) * 100}%` }}
                                />
                            </div>
                            <span className="text-[9px] text-muted-foreground font-medium">{mesesLabels[idx]}</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-primary/70" />
                        <span className="text-muted-foreground">Receitas</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-sm bg-red-400/70" />
                        <span className="text-muted-foreground">Despesas</span>
                    </div>
                </div>
            </div>

            {/* DAS info */}
            <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
                    <span className="text-base">💳</span> Valor DAS Mensal
                </h3>
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">{fmt(dasValue)}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                        Tipo: <strong className="text-foreground capitalize">{empresa.tipoAtividade === "ambos" ? "Comércio + Serviço" : empresa.tipoAtividade}</strong><br />
                        Vencimento: dia 20 de cada mês
                    </div>
                </div>
            </div>
        </div>
    );
}
