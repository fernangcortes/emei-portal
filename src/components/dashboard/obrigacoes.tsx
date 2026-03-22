"use client";

import { useFinanceiroStore } from "@/store/financeiro-store";
import { useEmpresaStore } from "@/store/empresa-store";
import { useState, useEffect } from "react";

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const mesesLabels = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export function Obrigacoes() {
    const { dasHistorico, toggleDas, transacoes } = useFinanceiroStore();
    const empresa = useEmpresaStore((s) => s.empresa);
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const now = new Date();
    const year = now.getFullYear();
    const dasValue = empresa.tipoAtividade === "comercio" ? 75.90 : empresa.tipoAtividade === "servico" ? 79.90 : 80.90;
    const pagoCount = dasHistorico.filter((d) => d.mes.startsWith(String(year)) && d.pago).length;

    // DASN data
    const lastYear = year - 1;
    const receitaLastYear = transacoes
        .filter((t) => t.tipo === "receita" && t.data.startsWith(String(lastYear)))
        .reduce((s, t) => s + t.valor, 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">Obrigações do MEI</h2>
                <p className="text-sm text-muted-foreground mt-0.5">DAS mensal, declaração anual e relatório de receitas.</p>
            </div>

            {/* DAS Calendar */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <span className="text-base">💳</span> DAS Mensal — {year}
                    </h3>
                    <span className="text-xs font-semibold text-muted-foreground">{pagoCount}/12 pagos · {fmt(dasValue)}/mês</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {mesesLabels.map((label, idx) => {
                        const mesKey = `${year}-${String(idx + 1).padStart(2, "0")}`;
                        const pago = dasHistorico.find((d) => d.mes === mesKey)?.pago ?? false;

                        let isNaoSeAplica = false;
                        if (empresa.dataAbertura) {
                            const [aAno, aMes] = empresa.dataAbertura.split("-").map(Number);
                            if (year < aAno || (year === aAno && idx < aMes - 1)) {
                                isNaoSeAplica = true;
                            }
                        }

                        const dueDate = new Date(year, idx + 1, 20);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const isAtrasado = !pago && !isNaoSeAplica && today > dueDate;
                        
                        let statusIcon = "⬜";
                        let statusText = "Pendente";
                        let statusClass = "border-border bg-card";

                        if (isNaoSeAplica) {
                            statusIcon = "➖";
                            statusText = "Não se aplica";
                            statusClass = "border-muted bg-muted/40 opacity-60 cursor-not-allowed";
                        } else if (pago) {
                            statusIcon = "✅";
                            statusText = "Pago";
                            statusClass = "border-primary/30 bg-primary/10";
                        } else if (isAtrasado) {
                            statusIcon = "❌";
                            statusText = "Atrasado";
                            statusClass = "border-red-200 bg-red-50 text-red-700";
                        } else if (today >= new Date(year, idx, 1) && today <= dueDate) {
                            const nextMonthStr = String(idx + 2 > 12 ? 1 : idx + 2).padStart(2, "0");
                            statusIcon = "⏰";
                            statusText = `Vence 20/${nextMonthStr}`;
                            statusClass = "border-amber-200 bg-amber-50 text-amber-900";
                        }

                        return (
                            <button
                                key={mesKey}
                                disabled={isNaoSeAplica}
                                onClick={() => !isNaoSeAplica && toggleDas(mesKey, dasValue)}
                                className={`rounded-xl border p-3 text-center transition-all ${
                                    !isNaoSeAplica && "hover:scale-105"
                                } ${statusClass}`}
                            >
                                <div className="text-xs font-bold">{label.slice(0, 3)}</div>
                                <div className="text-lg mt-1">{statusIcon}</div>
                                <div className="text-[10px] sm:text-[11px] font-medium mt-1 leading-tight">
                                    {statusText}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
                    💡 <strong>Dica:</strong> Pague o DAS pelo{" "}
                    <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" target="_blank" rel="noopener noreferrer" className="underline font-bold">
                        PGMEI
                    </a>{" "}
                    ou gere o boleto no app MEI do Governo. Vencimento: dia 20 de cada mês.
                </div>
            </div>

            {/* DASN-SIMEI */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">📋</span> DASN-SIMEI (Declaração Anual)
                </h3>
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-2">
                    <p className="text-sm font-bold text-amber-800">Prazo: até 31 de maio de {year}</p>
                    <p className="text-xs text-amber-700">
                        A declaração se refere ao faturamento do ano anterior ({lastYear}).
                        {receitaLastYear > 0 && (
                            <> Suas receitas registradas de {lastYear}: <strong>{fmt(receitaLastYear)}</strong>.</>
                        )}
                    </p>
                </div>
                <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Checklist</p>
                    {[
                        "Acessar o PGMEI no site da Receita Federal",
                        "Informar o faturamento bruto total do ano anterior",
                        "Indicar se houve empregado registrado",
                        "Transmitir a declaração e guardar o recibo",
                    ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                            <span className="shrink-0 mt-0.5 text-muted-foreground">{i + 1}.</span>
                            <span>{step}</span>
                        </div>
                    ))}
                </div>
                <a
                    href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110 transition-all"
                >
                    Acessar DASN-SIMEI
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
            </div>

            {/* Relatório Mensal */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                    <span className="text-base">📝</span> Relatório Mensal de Receitas
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    O MEI deve preencher mensalmente o Relatório Mensal de Receitas Brutas. Esse
                    relatório não precisa ser entregue, mas deve ser guardado por 5 anos junto com
                    as notas fiscais emitidas e recebidas.
                </p>
                <a
                    href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/relatorio-mensal-de-receitas"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                >
                    Baixar modelo oficial do Relatório
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                </a>
            </div>
        </div>
    );
}
