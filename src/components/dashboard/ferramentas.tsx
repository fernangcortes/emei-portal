"use client";

import { useEmpresaStore } from "@/store/empresa-store";
import { useState, useEffect } from "react";

export function Ferramentas() {
    const empresa = useEmpresaStore((s) => s.empresa);
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const dasValues = { comercio: 75.90, servico: 79.90, ambos: 80.90 };
    const dasAnual = dasValues[empresa.tipoAtividade] * 12;

    const tools = [
        {
            emoji: "🧮",
            title: "Calculadora DAS",
            description: `Com base na sua atividade (${empresa.tipoAtividade}), seu DAS mensal é:`,
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        {(Object.entries(dasValues) as [keyof typeof dasValues, number][]).map(([tipo, valor]) => (
                            <div key={tipo} className={`rounded-xl border p-3 text-center ${empresa.tipoAtividade === tipo ? "border-primary bg-primary/10" : "border-border"}`}>
                                <div className="text-xs font-bold uppercase capitalize">{tipo === "ambos" ? "Ambos" : tipo}</div>
                                <div className={`text-lg font-bold mt-1 ${empresa.tipoAtividade === tipo ? "text-primary" : ""}`}>R$ {valor.toFixed(2).replace(".", ",")}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Custo anual estimado: <strong>R$ {dasAnual.toFixed(2).replace(".", ",")}</strong></p>
                </div>
            ),
        },
        {
            emoji: "📊",
            title: "Simulador de Desenquadramento",
            description: "Descubra quando considerar migrar de MEI para ME.",
            content: (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { label: "Faturou até R$ 81.000", result: "✅ Continua MEI", color: "border-emerald-200 bg-emerald-50" },
                            { label: "Faturou R$ 81.001 — R$ 97.200", result: "⚠️ Paga diferença no Simples", color: "border-amber-200 bg-amber-50" },
                            { label: "Faturou acima de R$ 97.200", result: "❌ Desenquadrado retroativamente", color: "border-red-200 bg-red-50" },
                            { label: "Contratou 2+ funcionários", result: "❌ Deve migrar para ME", color: "border-red-200 bg-red-50" },
                        ].map((item) => (
                            <div key={item.label} className={`rounded-xl border p-3 ${item.color}`}>
                                <p className="text-xs font-medium">{item.label}</p>
                                <p className="text-sm font-bold mt-1">{item.result}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ),
        },
        {
            emoji: "🔗",
            title: "Links Rápidos do MEI",
            description: "Acesse os serviços do governo diretamente.",
            content: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                        { label: "Pagar DAS (PGMEI)", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" },
                        { label: "Declaração Anual (DASN)", url: "https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/dasnsimei.app/Identificacao" },
                        { label: "Emitir CCMEI", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/emissao-de-comprovante-ccmei" },
                        { label: "Alterar Dados", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/alteracao-de-dados" },
                        { label: "Emissor NF Nacional", url: "https://www.nfse.gov.br/EmissorNacional" },
                        { label: "Consultar CNPJ", url: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/cnpjreva_solicitacao.asp" },
                        { label: "Portal do Empreendedor", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" },
                        { label: "SEBRAE MEI", url: "https://sebrae.com.br/sites/PortalSebrae/mei" },
                    ].map((link) => (
                        <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                            <span className="group-hover:text-primary transition-colors">{link.label}</span>
                        </a>
                    ))}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold">Ferramentas</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Calculadoras, simuladores e atalhos úteis.</p>
            </div>
            {tools.map((tool) => (
                <div key={tool.title} className="rounded-2xl border border-border bg-card p-5 space-y-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <span className="text-base">{tool.emoji}</span> {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                    {tool.content}
                </div>
            ))}
        </div>
    );
}
