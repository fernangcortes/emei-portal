"use client";

interface SiteLink {
    name: string;
    description: string;
    url: string;
    category: "portal" | "impostos" | "fiscal" | "informacao";
    emoji: string;
}

const sites: SiteLink[] = [
    {
        name: "Portal do Empreendedor",
        description: "Site oficial para abrir, alterar ou fechar MEI",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
        category: "portal",
        emoji: "🏛️",
    },
    {
        name: "Gov.br (Conta)",
        description: "Criar ou gerenciar sua conta Gov.br",
        url: "https://sso.acesso.gov.br",
        category: "portal",
        emoji: "🔐",
    },
    {
        name: "PGMEI",
        description: "Gerar boleto DAS mensal para pagamento",
        url: "http://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao",
        category: "impostos",
        emoji: "💳",
    },
    {
        name: "DASN-SIMEI",
        description: "Declaração Anual do MEI",
        url: "https://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/dasnsimei.app/identificacao",
        category: "impostos",
        emoji: "📊",
    },
    {
        name: "Emissor Nacional NFS-e",
        description: "Emitir Nota Fiscal de Serviço eletrônica",
        url: "https://www.nfse.gov.br/EmissorNacional",
        category: "fiscal",
        emoji: "🧾",
    },
    {
        name: "Consulta CNPJ",
        description: "Verificar dados do seu CNPJ na Receita Federal",
        url: "https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
        category: "informacao",
        emoji: "🔍",
    },
    {
        name: "Simples Nacional",
        description: "Portal do Simples Nacional e Simei",
        url: "http://www8.receita.fazenda.gov.br/SimplesNacional/",
        category: "impostos",
        emoji: "📋",
    },
    {
        name: "REDESIM",
        description: "Rede Nacional para Simplificação de Empresas",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/redesim",
        category: "portal",
        emoji: "🌐",
    },
    {
        name: "Sebrae MEI",
        description: "Cursos, capacitações e suporte gratuito para MEI",
        url: "https://sebrae.com.br/sites/PortalSebrae/mei",
        category: "informacao",
        emoji: "🎓",
    },
    {
        name: "e-CAC",
        description: "Centro virtual de atendimento da Receita Federal",
        url: "https://cav.receita.fazenda.gov.br/",
        category: "impostos",
        emoji: "🖥️",
    },
    {
        name: "CadastroWeb (INSS)",
        description: "Atualizar dados cadastrais no INSS",
        url: "https://cadastroweb.inss.gov.br/",
        category: "portal",
        emoji: "🏥",
    },
    {
        name: "Meu INSS",
        description: "Consultar contribuições e benefícios INSS",
        url: "https://meu.inss.gov.br/",
        category: "informacao",
        emoji: "📱",
    },
    {
        name: "Relatório Mensal de Receitas",
        description: "Modelo de relatório para controle mensal",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/modelo-relatorio-mensal-receitas-brutas",
        category: "fiscal",
        emoji: "📝",
    },
    {
        name: "Comprovante MEI (CCMEI)",
        description: "Emitir o Certificado da Condição de MEI",
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
        category: "portal",
        emoji: "🏆",
    },
    {
        name: "Junta Comercial",
        description: "Consultar Juntas Comerciais dos estados",
        url: "https://www.gov.br/economia/pt-br/assuntos/drei/juntas-comerciais",
        category: "portal",
        emoji: "🏢",
    },
    {
        name: "Classificação CNAE",
        description: "Tabela oficial de atividades econômicas (IBGE)",
        url: "https://concla.ibge.gov.br/busca-online-cnae.html",
        category: "informacao",
        emoji: "📂",
    },
    {
        name: "Prefeitura (Alvará)",
        description: "Verificar exigências de alvará na sua cidade",
        url: "#",
        category: "portal",
        emoji: "🏠",
    },
    {
        name: "App MEI (Celular)",
        description: "App oficial do MEI para Android e iOS",
        url: "https://play.google.com/store/apps/details?id=br.gov.fazenda.meimicroempreendedor",
        category: "informacao",
        emoji: "📲",
    },
    {
        name: "Consulta Optantes Simei",
        description: "Verificar se está enquadrado no Simei",
        url: "http://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21",
        category: "impostos",
        emoji: "✅",
    },
    {
        name: "Cartilha do MEI (Sebrae)",
        description: "PDF completo com tudo sobre o MEI",
        url: "https://sebrae.com.br/Sebrae/Portal%20Sebrae/UFs/RN/Anexos/cartilha-MEI-2023.pdf",
        category: "informacao",
        emoji: "📚",
    },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
    portal: { label: "Portais", color: "bg-primary/10 text-primary" },
    impostos: { label: "Impostos", color: "bg-mei-gold/20 text-mei-gold-dark" },
    fiscal: { label: "Fiscal", color: "bg-blue-500/10 text-blue-700" },
    informacao: { label: "Informação", color: "bg-purple-500/10 text-purple-700" },
};

export function SitesUteisSection() {
    return (
        <section id="sites-uteis" className="scroll-mt-20 bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Top 20 <span className="text-primary">Sites Úteis</span>
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                        Todos os portais e ferramentas que você vai usar como MEI,
                        organizados por categoria.
                    </p>
                </div>

                {/* Category legend */}
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    {Object.entries(categoryLabels).map(([key, cat]) => (
                        <span
                            key={key}
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${cat.color}`}
                        >
                            {cat.label}
                        </span>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {sites.map((site) => (
                        <a
                            key={site.name}
                            href={site.url}
                            target={site.url === "#" ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-smooth"
                        >
                            <span className="text-2xl shrink-0 group-hover:scale-110 transition-smooth">
                                {site.emoji}
                            </span>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-smooth">
                                        {site.name}
                                    </h4>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                                    {site.description}
                                </p>
                                <span
                                    className={`inline-flex mt-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${categoryLabels[site.category]?.color || ""
                                        }`}
                                >
                                    {categoryLabels[site.category]?.label}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
