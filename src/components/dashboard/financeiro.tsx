"use client";

import { useFinanceiroStore, type Transacao } from "@/store/financeiro-store";
import { useEmpresaStore } from "@/store/empresa-store";
import { useState, useEffect, useMemo } from "react";

const catReceita = ["Venda de Produto", "Prestação de Serviço", "Comissão", "Freelance", "Consultoria", "Outros"];
const catDespesa = ["Material/Insumo", "Aluguel", "Transporte", "Marketing/Publicidade", "Equipamento", "Fornecedor", "Imposto/DAS", "Internet/Telefone", "Software/Assinatura", "Alimentação", "Manutenção", "Outros"];
const formasPagamento = [
    { value: "pix", label: "PIX", emoji: "⚡" },
    { value: "dinheiro", label: "Dinheiro", emoji: "💵" },
    { value: "cartao", label: "Cartão", emoji: "💳" },
    { value: "boleto", label: "Boleto", emoji: "📄" },
    { value: "transferencia", label: "Transferência", emoji: "🏦" },
    { value: "outro", label: "Outro", emoji: "📦" },
] as const;
const mesesLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const LIMITE_ANUAL = 81000;
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type SubTab = "lancamentos" | "fluxo" | "dre" | "orcamento" | "contas" | "saude" | "exportar";

const subTabs: { id: SubTab; label: string; emoji: string }[] = [
    { id: "lancamentos", label: "Lançamentos", emoji: "📝" },
    { id: "fluxo", label: "Fluxo de Caixa", emoji: "💧" },
    { id: "dre", label: "DRE", emoji: "📊" },
    { id: "orcamento", label: "Orçamento", emoji: "🎯" },
    { id: "contas", label: "Contas", emoji: "📋" },
    { id: "saude", label: "Saúde Financeira", emoji: "❤️" },
    { id: "exportar", label: "Exportar", emoji: "📥" },
];

export function Financeiro() {
    const store = useFinanceiroStore();
    const empresa = useEmpresaStore((s) => s.empresa);
    const { transacoes, addTransacao, removeTransacao, contas, addConta, removeConta, toggleContaPaga, orcamentos, setOrcamentos } = store;
    const [mounted, setMounted] = useState(false);
    const [subTab, setSubTab] = useState<SubTab>("lancamentos");
    const [showForm, setShowForm] = useState(false);
    const [filtro, setFiltro] = useState<"todos" | "receita" | "despesa">("todos");
    const [mesFiltro, setMesFiltro] = useState(() => {
        const n = new Date();
        return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
    });
    const [form, setForm] = useState<Omit<Transacao, "id">>({
        tipo: "receita", valor: 0, descricao: "", categoria: "", cliente: "", data: new Date().toISOString().slice(0, 10), pago: true, formaPagamento: "pix", recorrente: false, tags: [], notas: "",
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    const now = new Date();
    const currentYear = now.getFullYear();

    // Computed data
    const selectedMonth = useMemo(() => {
        const [y, m] = mesFiltro.split("-").map(Number);
        return { year: y, month: m - 1 };
    }, [mesFiltro]);

    const monthTx = useMemo(() =>
        transacoes.filter((t) => {
            const d = new Date(t.data);
            return d.getFullYear() === selectedMonth.year && d.getMonth() === selectedMonth.month;
        }).sort((a, b) => b.data.localeCompare(a.data)),
        [transacoes, selectedMonth]);

    const yearTx = useMemo(() =>
        transacoes.filter((t) => t.data.startsWith(String(currentYear))),
        [transacoes, currentYear]);

    const receitaMes = monthTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
    const despesaMes = monthTx.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
    const saldoMes = receitaMes - despesaMes;
    const receitaAnual = yearTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);

    // Monthly data for chart
    const monthlyData = useMemo(() =>
        mesesLabels.map((_, idx) => {
            const mTx = transacoes.filter((t) => {
                const d = new Date(t.data);
                return d.getFullYear() === currentYear && d.getMonth() === idx;
            });
            const receita = mTx.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
            const despesa = mTx.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
            return { receita, despesa, saldo: receita - despesa };
        }),
        [transacoes, currentYear]);

    // Category breakdown
    const categoryBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        monthTx.filter((t) => t.tipo === "despesa").forEach((t) => {
            map.set(t.categoria || "Outros", (map.get(t.categoria || "Outros") || 0) + t.valor);
        });
        return Array.from(map.entries())
            .map(([cat, valor]) => ({ cat, valor, pct: despesaMes > 0 ? (valor / despesaMes) * 100 : 0 }))
            .sort((a, b) => b.valor - a.valor);
    }, [monthTx, despesaMes]);

    // Payment method breakdown
    const paymentBreakdown = useMemo(() => {
        const map = new Map<string, number>();
        monthTx.filter((t) => t.tipo === "receita").forEach((t) => {
            const key = t.formaPagamento || "outro";
            map.set(key, (map.get(key) || 0) + t.valor);
        });
        return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    }, [monthTx]);

    // Financial health score (0-100)
    const healthScore = useMemo(() => {
        let score = 50; // base
        if (receitaMes > 0) score += 10;
        if (saldoMes > 0) score += 15;
        if (despesaMes > 0 && receitaMes / despesaMes > 2) score += 10;
        if (receitaAnual > 0 && receitaAnual < LIMITE_ANUAL * 0.8) score += 10;
        if (receitaAnual >= LIMITE_ANUAL * 0.9) score -= 15;
        const contasAtrasadas = contas.filter((c) => !c.pago && c.vencimento && c.vencimento < now.toISOString().slice(0, 10)).length;
        score -= contasAtrasadas * 5;
        return Math.max(0, Math.min(100, score));
    }, [receitaMes, despesaMes, saldoMes, receitaAnual, contas, now]);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const handleSubmit = () => {
        if (!form.descricao || form.valor <= 0) return;
        addTransacao({ ...form, categoria: form.categoria || (form.tipo === "receita" ? catReceita[0] : catDespesa[0]) });
        setForm({ tipo: "receita", valor: 0, descricao: "", categoria: "", cliente: "", data: new Date().toISOString().slice(0, 10), pago: true, formaPagamento: "pix", recorrente: false, tags: [], notas: "" });
        setShowForm(false);
    };

    const filtered = filtro === "todos" ? monthTx : monthTx.filter((t) => t.tipo === filtro);
    const dasValue = empresa.tipoAtividade === "comercio" ? 75.90 : empresa.tipoAtividade === "servico" ? 79.90 : 80.90;
    const pctFat = Math.min((receitaAnual / LIMITE_ANUAL) * 100, 100);

    // —— EXPORT FUNCTIONS ——
    const exportCSV = () => {
        const header = "Data;Tipo;Descrição;Categoria;Cliente;Valor;Forma Pagamento;Pago\n";
        const rows = transacoes.map((t) =>
            `${t.data};${t.tipo};${t.descricao};${t.categoria};${t.cliente || ""};${t.valor.toFixed(2).replace(".", ",")};${t.formaPagamento || ""};${t.pago ? "Sim" : "Não"}`
        ).join("\n");
        download(header + rows, "financeiro_mei.csv", "text/csv;charset=utf-8");
    };

    const exportJSON = () => {
        download(JSON.stringify({ transacoes, contas, orcamentos }, null, 2), "financeiro_mei.json", "application/json");
    };

    const download = (content: string, filename: string, type: string) => {
        const blob = new Blob(["\uFEFF" + content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    // Colors for categories
    const catColors = ["bg-primary", "bg-blue-500", "bg-amber-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500", "bg-teal-500", "bg-indigo-500", "bg-lime-500"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Gestão Financeira</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Contabilidade completa do seu MEI.</p>
                </div>
                <div className="flex gap-2">
                    <input type="month" value={mesFiltro} onChange={(e) => setMesFiltro(e.target.value)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button onClick={() => setShowForm(!showForm)}
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 transition-all">
                        + Lançamento
                    </button>
                </div>
            </div>

            {/* Quick summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Receitas</div>
                    <div className="text-lg font-bold text-primary mt-0.5">{fmt(receitaMes)}</div>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Despesas</div>
                    <div className="text-lg font-bold text-red-600 mt-0.5">{fmt(despesaMes)}</div>
                </div>
                <div className={`rounded-2xl border p-3 text-center ${saldoMes >= 0 ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lucro</div>
                    <div className={`text-lg font-bold mt-0.5 ${saldoMes >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(saldoMes)}</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Faturamento {currentYear}</div>
                    <div className="text-lg font-bold mt-0.5">{fmt(receitaAnual)}</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                        <div className={`h-full rounded-full ${pctFat >= 80 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${pctFat}%` }} />
                    </div>
                </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-border">
                {subTabs.map((tab) => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all border-b-2 -mb-px ${subTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}>
                        <span>{tab.emoji}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* New transaction form */}
            {showForm && (
                <div className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4">
                    <h3 className="text-sm font-bold">Novo Lançamento</h3>
                    <div className="flex gap-2">
                        {(["receita", "despesa"] as const).map((t) => (
                            <button key={t} onClick={() => setForm({ ...form, tipo: t })}
                                className={`flex-1 rounded-xl border p-2.5 text-sm font-bold transition-all ${form.tipo === t ? (t === "receita" ? "border-primary bg-primary/10 text-primary" : "border-red-400 bg-red-50 text-red-600") : "border-border text-muted-foreground"}`}>
                                {t === "receita" ? "📈 Receita" : "📉 Despesa"}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição *" className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input type="number" value={form.valor || ""} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} placeholder="Valor (R$) *" min={0} step={0.01} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">Categoria</option>
                            {(form.tipo === "receita" ? catReceita : catDespesa).map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input value={form.cliente || ""} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Cliente/Fornecedor" className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="flex gap-2">
                            {formasPagamento.map((fp) => (
                                <button key={fp.value} onClick={() => setForm({ ...form, formaPagamento: fp.value })}
                                    className={`flex-1 rounded-lg border p-1.5 text-center transition-all ${form.formaPagamento === fp.value ? "border-primary bg-primary/10" : "border-border"}`}
                                    title={fp.label}>
                                    <span className="text-sm">{fp.emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea value={form.notas || ""} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Observações (opcional)" rows={2} className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.recorrente} onChange={(e) => setForm({ ...form, recorrente: e.target.checked })} className="rounded" />
                            <span className="text-xs font-medium text-muted-foreground">🔄 Recorrente (mensal)</span>
                        </label>
                        <div className="flex gap-2">
                            <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-accent">Cancelar</button>
                            <button onClick={handleSubmit} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ LANÇAMENTOS TAB ═══ */}
            {subTab === "lancamentos" && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card overflow-hidden">
                        <div className="flex gap-1 p-3 border-b border-border">
                            {([["todos", "Todos"], ["receita", "📈 Receitas"], ["despesa", "📉 Despesas"]] as const).map(([val, label]) => (
                                <button key={val} onClick={() => setFiltro(val)}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${filtro === val ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>{label}</button>
                            ))}
                            <span className="ml-auto text-xs text-muted-foreground self-center">{filtered.length} registros</span>
                        </div>
                        {filtered.length === 0 ? (
                            <div className="p-10 text-center text-sm text-muted-foreground">Nenhum lançamento neste mês.</div>
                        ) : (
                            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                                {filtered.map((t) => (
                                    <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`shrink-0 h-2.5 w-2.5 rounded-full ${t.tipo === "receita" ? "bg-primary" : "bg-red-400"}`} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{t.descricao}</p>
                                                    {t.recorrente && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">🔄</span>}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {new Date(t.data + "T12:00").toLocaleDateString("pt-BR")} · {t.categoria}
                                                    {t.cliente ? ` · ${t.cliente}` : ""}
                                                    {t.formaPagamento ? ` · ${formasPagamento.find((f) => f.value === t.formaPagamento)?.emoji || ""}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-sm font-bold tabular-nums ${t.tipo === "receita" ? "text-primary" : "text-red-600"}`}>
                                                {t.tipo === "receita" ? "+" : "-"}{fmt(t.valor)}
                                            </span>
                                            <button onClick={() => removeTransacao(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all" title="Remover">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ FLUXO DE CAIXA TAB ═══ */}
            {subTab === "fluxo" && (
                <div className="space-y-4">
                    {/* Bar chart */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h3 className="text-sm font-bold">📈 Receitas × Despesas — {currentYear}</h3>
                        <div className="flex items-end gap-1.5 h-44">
                            {monthlyData.map((d, idx) => {
                                const max = Math.max(...monthlyData.map((m) => Math.max(m.receita, m.despesa)), 1);
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-1" title={`${mesesLabels[idx]}: ${fmt(d.receita)} receita / ${fmt(d.despesa)} despesa`}>
                                        <div className="w-full flex gap-0.5 items-end h-36">
                                            <div className="flex-1 rounded-t bg-primary/70 transition-all duration-500" style={{ height: `${Math.max((d.receita / max) * 100, 1)}%` }} />
                                            <div className="flex-1 rounded-t bg-red-400/70 transition-all duration-500" style={{ height: `${Math.max((d.despesa / max) * 100, 1)}%` }} />
                                        </div>
                                        <span className="text-[9px] text-muted-foreground font-medium">{mesesLabels[idx]}</span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex gap-6 text-xs">
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-primary/70" /><span className="text-muted-foreground">Receitas</span></div>
                            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-sm bg-red-400/70" /><span className="text-muted-foreground">Despesas</span></div>
                        </div>
                    </div>

                    {/* Running balance */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                        <h3 className="text-sm font-bold">💰 Saldo Acumulado Mensal</h3>
                        <div className="space-y-2">
                            {(() => {
                                let acum = 0;
                                return monthlyData.map((d, idx) => {
                                    acum += d.saldo;
                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="text-xs font-bold w-8 text-muted-foreground">{mesesLabels[idx]}</span>
                                            <div className="flex-1 h-6 rounded-lg bg-muted relative overflow-hidden">
                                                <div className={`h-full rounded-lg transition-all ${acum >= 0 ? "bg-emerald-400/60" : "bg-red-400/60"}`}
                                                    style={{ width: `${Math.min(Math.abs(acum) / Math.max(...monthlyData.reduce((acc, m, i) => { const s = monthlyData.slice(0, i + 1).reduce((a, x) => a + x.saldo, 0); return [...acc, Math.abs(s)]; }, [] as number[]), 1) * 100, 100)}%` }} />
                                            </div>
                                            <span className={`text-xs font-bold tabular-nums w-24 text-right ${acum >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(acum)}</span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Payment methods */}
                    {paymentBreakdown.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                            <h3 className="text-sm font-bold">⚡ Receitas por Forma de Pagamento</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {paymentBreakdown.map(([key, valor]) => {
                                    const fp = formasPagamento.find((f) => f.value === key);
                                    return (
                                        <div key={key} className="rounded-xl border border-border p-3 text-center">
                                            <span className="text-2xl">{fp?.emoji || "📦"}</span>
                                            <div className="text-xs font-bold mt-1">{fp?.label || key}</div>
                                            <div className="text-sm font-bold text-primary">{fmt(valor)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ DRE TAB ═══ */}
            {subTab === "dre" && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-1">
                        <h3 className="text-sm font-bold mb-4">📊 Demonstração de Resultados — {mesesLabels[selectedMonth.month]} {selectedMonth.year}</h3>
                        {[
                            { label: "(+) Receita Bruta de Vendas/Serviços", value: receitaMes, bold: true, color: "text-primary" },
                            { label: "(-) DAS Simples Nacional", value: dasValue, bold: false, color: "text-red-500" },
                            { label: "(=) Receita Líquida", value: receitaMes - dasValue, bold: true, color: "" },
                            { label: "", value: 0, bold: false, color: "", separator: true },
                            ...categoryBreakdown.map((c) => ({ label: `(-) ${c.cat}`, value: c.valor, bold: false, color: "text-red-500" })),
                            { label: "(=) Total de Despesas Operacionais", value: despesaMes, bold: true, color: "text-red-600" },
                            { label: "", value: 0, bold: false, color: "", separator: true },
                            { label: "(=) RESULTADO DO PERÍODO", value: saldoMes - dasValue, bold: true, color: saldoMes - dasValue >= 0 ? "text-emerald-600" : "text-red-600" },
                        ].map((row, i) =>
                            'separator' in row && row.separator
                                ? <div key={i} className="border-b border-dashed border-border my-2" />
                                : (
                                    <div key={i} className={`flex justify-between py-1.5 px-2 rounded-lg ${row.bold ? "bg-muted/50" : "hover:bg-accent/30"}`}>
                                        <span className={`text-sm ${row.bold ? "font-bold" : ""}`}>{row.label}</span>
                                        <span className={`text-sm tabular-nums font-bold ${row.color}`}>
                                            {row.value < 0 ? `-${fmt(Math.abs(row.value))}` : fmt(row.value)}
                                        </span>
                                    </div>
                                )
                        )}
                    </div>

                    {/* Margem de Lucro */}
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                        <h3 className="text-sm font-bold">📐 Indicadores de Rentabilidade</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "Margem Bruta", value: receitaMes > 0 ? ((receitaMes - despesaMes) / receitaMes * 100) : 0 },
                                { label: "Margem Líquida", value: receitaMes > 0 ? ((receitaMes - despesaMes - dasValue) / receitaMes * 100) : 0 },
                                { label: "Custo/Receita", value: receitaMes > 0 ? (despesaMes / receitaMes * 100) : 0 },
                            ].map((ind) => (
                                <div key={ind.label} className="rounded-xl border border-border p-3 text-center">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{ind.label}</div>
                                    <div className={`text-xl font-bold mt-1 ${ind.value > 30 ? "text-emerald-600" : ind.value > 0 ? "text-amber-600" : "text-red-600"}`}>
                                        {ind.value.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ ORÇAMENTO TAB ═══ */}
            {subTab === "orcamento" && <OrcamentoSection orcamentos={orcamentos} setOrcamentos={setOrcamentos} categoryBreakdown={categoryBreakdown} despesaMes={despesaMes} />}

            {/* ═══ CONTAS TAB ═══ */}
            {subTab === "contas" && (
                <ContasSection contas={contas} addConta={addConta} removeConta={removeConta} toggleContaPaga={toggleContaPaga} />
            )}

            {/* ═══ SAÚDE FINANCEIRA TAB ═══ */}
            {subTab === "saude" && (
                <div className="space-y-4">
                    {/* Score ring */}
                    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4">
                        <h3 className="text-sm font-bold">Saúde Financeira do seu MEI</h3>
                        <div className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
                                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 42}`}
                                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - healthScore / 100)}`}
                                    strokeLinecap="round"
                                    className={`transition-all duration-1000 ${healthScore >= 70 ? "stroke-emerald-500" : healthScore >= 40 ? "stroke-amber-500" : "stroke-red-500"}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold">{healthScore}</span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase">pontos</span>
                            </div>
                        </div>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${healthScore >= 70 ? "bg-emerald-100 text-emerald-700" : healthScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            {healthScore >= 70 ? "🌟 Excelente" : healthScore >= 40 ? "⚡ Atenção" : "🔴 Crítico"}
                        </span>
                    </div>

                    {/* Diagnosis cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { emoji: saldoMes >= 0 ? "✅" : "⚠️", title: "Resultado Mensal", desc: saldoMes >= 0 ? `Lucro de ${fmt(saldoMes)} este mês.` : `Prejuízo de ${fmt(Math.abs(saldoMes))} este mês.`, ok: saldoMes >= 0 },
                            { emoji: pctFat < 80 ? "✅" : "🚨", title: "Limite Faturamento", desc: `${pctFat.toFixed(0)}% do limite anual (${fmt(receitaAnual)}/${fmt(LIMITE_ANUAL)}).`, ok: pctFat < 80 },
                            { emoji: contas.filter((c) => !c.pago).length === 0 ? "✅" : "⏰", title: "Contas Pendentes", desc: `${contas.filter((c) => !c.pago).length} conta(s) sem pagamento.`, ok: contas.filter((c) => !c.pago).length === 0 },
                            { emoji: receitaMes > despesaMes * 1.3 ? "✅" : "💡", title: "Reserva de Segurança", desc: receitaMes > despesaMes * 1.3 ? "Receita supera despesas em 30%+. Bom ritmo!" : "Receita muito próxima das despesas. Considere reduzir custos.", ok: receitaMes > despesaMes * 1.3 },
                        ].map((card) => (
                            <div key={card.title} className={`rounded-2xl border p-4 ${card.ok ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{card.emoji}</span>
                                    <h4 className="text-sm font-bold">{card.title}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground">{card.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Category visual */}
                    {categoryBreakdown.length > 0 && (
                        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                            <h3 className="text-sm font-bold">🏷️ Para onde vai seu dinheiro?</h3>
                            <div className="flex rounded-full overflow-hidden h-6">
                                {categoryBreakdown.map((c, i) => (
                                    <div key={c.cat} className={`${catColors[i % catColors.length]} transition-all`} style={{ width: `${c.pct}%` }} title={`${c.cat}: ${fmt(c.valor)} (${c.pct.toFixed(0)}%)`} />
                                ))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {categoryBreakdown.map((c, i) => (
                                    <div key={c.cat} className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-sm shrink-0 ${catColors[i % catColors.length]}`} />
                                        <span className="text-xs truncate">{c.cat}</span>
                                        <span className="text-xs font-bold text-muted-foreground ml-auto">{c.pct.toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ EXPORTAR TAB ═══ */}
            {subTab === "exportar" && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                        <h3 className="text-sm font-bold">📥 Exportar Dados Financeiros</h3>
                        <p className="text-xs text-muted-foreground">Baixe seus dados para usar no Excel, Planilhas Google ou como backup.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={exportCSV} className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 text-center hover:border-emerald-400 hover:shadow-md transition-all group">
                                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">📊</span>
                                <span className="text-sm font-bold block">Exportar CSV</span>
                                <span className="text-[10px] text-muted-foreground">Compatível com Excel e Google Sheets</span>
                            </button>
                            <button onClick={exportJSON} className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 p-6 text-center hover:border-blue-400 hover:shadow-md transition-all group">
                                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">💾</span>
                                <span className="text-sm font-bold block">Exportar JSON</span>
                                <span className="text-[10px] text-muted-foreground">Backup completo (transações + contas + orçamentos)</span>
                            </button>
                        </div>
                    </div>
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                        💡 <strong>Dica:</strong> Exporte mensalmente para manter um registro seguro fora do navegador. O CSV usa &quot;;&quot; como separador (padrão BR).
                    </div>
                </div>
            )}
        </div>
    );
}

// ————————————————— Sub-components —————————————————

function OrcamentoSection({ orcamentos, setOrcamentos, categoryBreakdown, despesaMes }: {
    orcamentos: { categoria: string; limite: number }[];
    setOrcamentos: (o: { categoria: string; limite: number }[]) => void;
    categoryBreakdown: { cat: string; valor: number; pct: number }[];
    despesaMes: number;
}) {
    const catDespesa = ["Material/Insumo", "Aluguel", "Transporte", "Marketing/Publicidade", "Equipamento", "Fornecedor", "Imposto/DAS", "Internet/Telefone", "Software/Assinatura", "Alimentação", "Manutenção", "Outros"];
    const [newCat, setNewCat] = useState("");
    const [newLimite, setNewLimite] = useState(0);

    const add = () => {
        if (!newCat || newLimite <= 0) return;
        setOrcamentos([...orcamentos.filter((o) => o.categoria !== newCat), { categoria: newCat, limite: newLimite }]);
        setNewCat(""); setNewLimite(0);
    };
    const remove = (cat: string) => setOrcamentos(orcamentos.filter((o) => o.categoria !== cat));

    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold">🎯 Orçamento por Categoria</h3>
                <p className="text-xs text-muted-foreground">Defina limites de gastos por categoria e acompanhe em tempo real.</p>
                <div className="flex gap-2">
                    <select value={newCat} onChange={(e) => setNewCat(e.target.value)} className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Categoria</option>
                        {catDespesa.filter((c) => !orcamentos.some((o) => o.categoria === c)).map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" value={newLimite || ""} onChange={(e) => setNewLimite(Number(e.target.value))} placeholder="Limite R$" className="w-32 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <button onClick={add} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110 transition-all">+</button>
                </div>
                {orcamentos.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum orçamento definido.</p>
                ) : (
                    <div className="space-y-3">
                        {orcamentos.map((o) => {
                            const gasto = categoryBreakdown.find((c) => c.cat === o.categoria)?.valor || 0;
                            const pct = Math.min((gasto / o.limite) * 100, 100);
                            const over = gasto > o.limite;
                            return (
                                <div key={o.categoria} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold">{o.categoria}</span>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${over ? "text-red-600" : "text-muted-foreground"}`}>
                                                {fmt(gasto)} / {fmt(o.limite)}
                                            </span>
                                            <button onClick={() => remove(o.categoria)} className="text-muted-foreground hover:text-red-500 text-xs">✕</button>
                                        </div>
                                    </div>
                                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${over ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary"}`}
                                            style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Total budget */}
            {orcamentos.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                    <div className="flex justify-between">
                        <span className="text-sm font-bold">Total Orçado</span>
                        <span className="text-sm font-bold">{fmt(orcamentos.reduce((s, o) => s + o.limite, 0))}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Total Gasto</span>
                        <span className={`text-xs font-bold ${despesaMes > orcamentos.reduce((s, o) => s + o.limite, 0) ? "text-red-600" : "text-emerald-600"}`}>{fmt(despesaMes)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContasSection({ contas, addConta, removeConta, toggleContaPaga }: {
    contas: { id: string; tipo: "receber" | "pagar"; descricao: string; valor: number; vencimento: string; cliente?: string; pago: boolean }[];
    addConta: (c: Omit<typeof contas[0], "id">) => void;
    removeConta: (id: string) => void;
    toggleContaPaga: (id: string) => void;
}) {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ tipo: "receber" as "receber" | "pagar", descricao: "", valor: 0, vencimento: "", cliente: "" });

    const handleAdd = () => {
        if (!form.descricao || form.valor <= 0) return;
        addConta({ ...form, pago: false });
        setForm({ tipo: "receber", descricao: "", valor: 0, vencimento: "", cliente: "" });
        setShowForm(false);
    };

    const totalReceber = contas.filter((c) => c.tipo === "receber" && !c.pago).reduce((s, c) => s + c.valor, 0);
    const totalPagar = contas.filter((c) => c.tipo === "pagar" && !c.pago).reduce((s, c) => s + c.valor, 0);
    const today = new Date().toISOString().slice(0, 10);
    const atrasadas = contas.filter((c) => !c.pago && c.vencimento && c.vencimento < today).length;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">A Receber</div>
                    <div className="text-lg font-bold text-primary mt-0.5">{fmt(totalReceber)}</div>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">A Pagar</div>
                    <div className="text-lg font-bold text-red-600 mt-0.5">{fmt(totalPagar)}</div>
                </div>
                <div className={`rounded-2xl border p-3 text-center ${atrasadas > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"}`}>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Atrasadas</div>
                    <div className={`text-lg font-bold mt-0.5 ${atrasadas > 0 ? "text-red-600" : "text-emerald-600"}`}>{atrasadas}</div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">Contas Pendentes</h3>
                    <button onClick={() => setShowForm(!showForm)} className="text-xs font-bold text-primary hover:underline">+ Adicionar</button>
                </div>
                {showForm && (
                    <div className="p-4 rounded-xl border border-dashed border-primary/30 space-y-3">
                        <div className="flex gap-2">
                            {(["receber", "pagar"] as const).map((t) => (
                                <button key={t} onClick={() => setForm({ ...form, tipo: t })}
                                    className={`flex-1 rounded-lg border p-2 text-xs font-bold ${form.tipo === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                                    {t === "receber" ? "📈 A Receber" : "📉 A Pagar"}
                                </button>
                            ))}
                        </div>
                        <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descrição" className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="flex gap-3">
                            <input type="number" value={form.valor || ""} onChange={(e) => setForm({ ...form, valor: Number(e.target.value) })} placeholder="Valor" className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            <input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Cliente/Fornecedor" className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <button onClick={handleAdd} className="w-full rounded-xl bg-primary py-2 text-sm font-bold text-primary-foreground">Salvar</button>
                    </div>
                )}
                {contas.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Nenhuma conta pendente.</p>
                ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                        {contas.map((c) => (
                            <div key={c.id} className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${c.pago ? "border-border/40 opacity-50" : c.tipo === "receber" ? "border-primary/20 bg-primary/5" : !c.pago && c.vencimento && c.vencimento < today ? "border-red-300 bg-red-50" : "border-red-200 bg-red-50/50"}`}>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => toggleContaPaga(c.id)} className={`h-5 w-5 rounded-md border-2 shrink-0 flex items-center justify-center ${c.pago ? "bg-primary border-primary text-white" : "border-border"}`}>
                                        {c.pago && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
                                    </button>
                                    <div>
                                        <p className={`text-sm font-medium ${c.pago ? "line-through" : ""}`}>{c.descricao}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {c.tipo === "receber" ? "A receber" : "A pagar"}
                                            {c.vencimento && ` · Venc: ${new Date(c.vencimento + "T12:00").toLocaleDateString("pt-BR")}`}
                                            {!c.pago && c.vencimento && c.vencimento < today && " · ⚠️ Atrasada"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${c.tipo === "receber" ? "text-primary" : "text-red-600"}`}>{fmt(c.valor)}</span>
                                    <button onClick={() => removeConta(c.id)} className="text-muted-foreground hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
