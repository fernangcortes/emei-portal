"use client";

import { Card, CardContent } from "@/components/ui/card";

interface InfoItem {
    emoji: string;
    title: string;
    description: string;
}

const prosItems: InfoItem[] = [
    {
        emoji: "📄",
        title: "CNPJ Gratuito",
        description: "Formalização sem custo, com CNPJ próprio para emitir notas e abrir conta PJ.",
    },
    {
        emoji: "💰",
        title: "Imposto Simplificado",
        description: "Pague um valor fixo mensal (DAS): R$75,90 (comércio), R$79,90 (serviço) ou R$80,90 (ambos).",
    },
    {
        emoji: "🏥",
        title: "Benefícios do INSS",
        description: "Aposentadoria, auxílio-doença, salário-maternidade e pensão por morte.",
    },
    {
        emoji: "🧾",
        title: "Emissão de NF",
        description: "Emita notas fiscais de serviço pelo Emissor Nacional gratuitamente.",
    },
    {
        emoji: "📊",
        title: "Contabilidade Simples",
        description: "Dispensa de contabilidade formal. Basta preencher o Relatório Mensal de Receitas.",
    },
    {
        emoji: "🏦",
        title: "Acesso a Crédito",
        description: "Linhas de crédito especiais para MEI em bancos públicos e privados.",
    },
];

const consItems: InfoItem[] = [
    {
        emoji: "📉",
        title: "Limite de Faturamento",
        description: "Faturamento máximo de R$81.000/ano (R$6.750/mês). Se ultrapassar, precisa mudar para ME.",
    },
    {
        emoji: "👤",
        title: "Máximo 1 Funcionário",
        description: "O MEI pode contratar apenas 1 (um) empregado que receba salário mínimo ou piso da categoria.",
    },
    {
        emoji: "🚫",
        title: "Atividades Restritas",
        description: "Nem toda atividade pode ser MEI. Profissões regulamentadas (advogado, médico, etc.) não são permitidas.",
    },
    {
        emoji: "🤝",
        title: "Sem Sócios",
        description: "O MEI não pode ter sócios nem ser sócio/administrador de outra empresa.",
    },
    {
        emoji: "🆔",
        title: "Nome Fantasia Extinto",
        description: "A Receita Federal descontinuou o Nome Fantasia em 2023. O nome empresarial agora é CPF + 8 dígitos do CNPJ.",
    },
    {
        emoji: "🛡️",
        title: "Marca no INPI",
        description: "Para usar uma marca comercial legalmente, o registro no INPI é altamente recomendado pelo governo.",
    },
];

export function OQueEMeiSection() {
    return (
        <section id="o-que-e-mei" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">
                        O que é o <span className="text-primary">MEI</span>?
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                        O Microempreendedor Individual é a forma mais simples de formalizar
                        um pequeno negócio no Brasil. Conheça as vantagens e limitações.
                    </p>
                </div>

                {/* Pros */}
                <div className="mb-10">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs">✅</span>
                        Vantagens
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {prosItems.map((item) => (
                            <Card key={item.title} className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-smooth group">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl shrink-0 group-hover:scale-110 transition-smooth">{item.emoji}</span>
                                        <div>
                                            <h4 className="font-semibold text-sm">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Cons (Limitations Box) */}
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-destructive">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/10 text-sm">⚠️</span>
                        Limitações e Regras Importantes
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {consItems.map((item) => (
                            <Card key={item.title} className="border-destructive/10 bg-white/50 hover:border-destructive/30 hover:shadow-sm transition-smooth group">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl shrink-0 group-hover:scale-110 transition-smooth">{item.emoji}</span>
                                        <div>
                                            <h4 className="font-bold text-sm text-destructive/90">{item.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed italic">{item.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="mt-6 p-4 rounded-2xl bg-white/40 border border-destructive/10 text-xs text-muted-foreground leading-relaxed">
                        <p><strong>Nota:</strong> O descumprimento dessas regras pode acarretar no desenquadramento automático do MEI e na cobrança de impostos retroativos como Microempresa (ME).</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
