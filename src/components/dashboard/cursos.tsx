"use client";

import { useState, useEffect } from "react";

interface Curso {
    id: string;
    titulo: string;
    fonte: string;
    url: string;
    categoria: string;
    duracao: string;
    gratis: boolean;
    nivel: "iniciante" | "intermediario" | "avancado";
    descricao: string;
    emoji: string;
}

const cursos: Curso[] = [
    // Gestão e Empreendedorismo
    { id: "1", titulo: "MEI — Formalização e Primeiros Passos", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Gestão", duracao: "3h", gratis: true, nivel: "iniciante", descricao: "Aprenda tudo sobre formalização, direitos e deveres do MEI.", emoji: "🚀" },
    { id: "2", titulo: "Gestão Financeira para MEI", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Finanças", duracao: "4h", gratis: true, nivel: "iniciante", descricao: "Controle de caixa, fluxo financeiro e planejamento para micro negócios.", emoji: "💰" },
    { id: "3", titulo: "Planejamento Estratégico para Pequenos Negócios", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Gestão", duracao: "4h", gratis: true, nivel: "intermediario", descricao: "Defina metas, estratégias e planos de ação para seu negócio crescer.", emoji: "📋" },
    { id: "4", titulo: "Contabilidade para Empreendedores", fonte: "FGV Online", url: "https://educacao.fgv.br/cursos/gratuitos", categoria: "Finanças", duracao: "5h", gratis: true, nivel: "iniciante", descricao: "Noções básicas de contabilidade voltadas para pequenos empresários.", emoji: "📊" },

    // Marketing e Vendas
    { id: "5", titulo: "Marketing Digital para o Empreendedor", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Marketing", duracao: "3h", gratis: true, nivel: "iniciante", descricao: "Estratégias de marketing digital para atrair e fidelizar clientes.", emoji: "📱" },
    { id: "6", titulo: "Como Vender Mais e Melhor", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Vendas", duracao: "3h", gratis: true, nivel: "iniciante", descricao: "Técnicas de vendas, negociação e atendimento ao cliente.", emoji: "🎯" },
    { id: "7", titulo: "Instagram para Negócios", fonte: "Meta Blueprint", url: "https://www.facebookblueprint.com/", categoria: "Marketing", duracao: "2h", gratis: true, nivel: "iniciante", descricao: "Use o Instagram profissionalmente para promover seu negócio.", emoji: "📸" },
    { id: "8", titulo: "Google Meu Negócio", fonte: "Google Skillshop", url: "https://skillshop.withgoogle.com/", categoria: "Marketing", duracao: "1h", gratis: true, nivel: "iniciante", descricao: "Coloque seu negócio no Google Maps e seja encontrado por clientes.", emoji: "🗺️" },

    // Fiscal e Tributário
    { id: "9", titulo: "Obrigações Fiscais do MEI", fonte: "Portal do Empreendedor", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor", categoria: "Fiscal", duracao: "2h", gratis: true, nivel: "iniciante", descricao: "DAS, DASN-SIMEI e tudo que o MEI precisa declarar.", emoji: "📋" },
    { id: "10", titulo: "Nota Fiscal Eletrônica — NFS-e Nacional", fonte: "Receita Federal", url: "https://www.nfse.gov.br/EmissorNacional", categoria: "Fiscal", duracao: "1h", gratis: true, nivel: "iniciante", descricao: "Aprenda a emitir notas fiscais pelo Emissor Nacional.", emoji: "🧾" },
    { id: "11", titulo: "Simples Nacional e Desenquadramento", fonte: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", categoria: "Fiscal", duracao: "3h", gratis: true, nivel: "intermediario", descricao: "Entenda o Simples Nacional e quando migrar de MEI para ME.", emoji: "📈" },

    // Desenvolvimento Pessoal
    { id: "12", titulo: "Liderança e Gestão de Pessoas", fonte: "FGV Online", url: "https://educacao.fgv.br/cursos/gratuitos", categoria: "Desenvolvimento", duracao: "4h", gratis: true, nivel: "intermediario", descricao: "Gestão de equipe e habilidades de liderança para empreendedores.", emoji: "👥" },
    { id: "13", titulo: "Educação Financeira Pessoal", fonte: "Banco Central", url: "https://www.bcb.gov.br/cidadaniafinanceira/cursos", categoria: "Finanças", duracao: "3h", gratis: true, nivel: "iniciante", descricao: "Separe finanças pessoais e empresariais, invista com sabedoria.", emoji: "🏦" },
    { id: "14", titulo: "Negociação e Resolução de Conflitos", fonte: "FGV Online", url: "https://educacao.fgv.br/cursos/gratuitos", categoria: "Desenvolvimento", duracao: "3h", gratis: true, nivel: "intermediario", descricao: "Técnicas de negociação para fechar melhores acordos.", emoji: "🤝" },

    // Tecnologia
    { id: "15", titulo: "Excel Básico para Empreendedores", fonte: "Microsoft Learn", url: "https://learn.microsoft.com/pt-br/training/", categoria: "Tecnologia", duracao: "4h", gratis: true, nivel: "iniciante", descricao: "Domine planilhas para controlar seu negócio com eficiência.", emoji: "📊" },
    { id: "16", titulo: "Ferramentas Google para Negócios", fonte: "Google Skillshop", url: "https://skillshop.withgoogle.com/", categoria: "Tecnologia", duracao: "2h", gratis: true, nivel: "iniciante", descricao: "Gmail, Drive, Agenda e outras ferramentas gratuitas para produtividade.", emoji: "⚙️" },

    // Direito e Compliance
    { id: "17", titulo: "Direitos do Consumidor para MEI", fonte: "SENAC", url: "https://www.ead.senac.br/cursos-gratuitos/", categoria: "Direito", duracao: "2h", gratis: true, nivel: "iniciante", descricao: "Conheça o CDC e proteja seu negócio de problemas jurídicos.", emoji: "⚖️" },
    { id: "18", titulo: "LGPD para Pequenos Negócios", fonte: "SERPRO", url: "https://www.serpro.gov.br/lgpd", categoria: "Direito", duracao: "2h", gratis: true, nivel: "intermediario", descricao: "Proteja os dados dos seus clientes e esteja em conformidade.", emoji: "🔒" },
];

const categorias = ["Todos", "Gestão", "Finanças", "Marketing", "Vendas", "Fiscal", "Desenvolvimento", "Tecnologia", "Direito"];

const trilhas = [
    {
        titulo: "MEI do Zero",
        descricao: "Tudo que você precisa para começar como MEI",
        emoji: "🌱",
        cor: "from-emerald-500 to-green-600",
        cursoIds: ["1", "9", "10", "2"],
    },
    {
        titulo: "Marketing Digital",
        descricao: "Domine o digital e atraia mais clientes",
        emoji: "📱",
        cor: "from-blue-500 to-indigo-600",
        cursoIds: ["5", "7", "8", "6"],
    },
    {
        titulo: "Finanças no Controle",
        descricao: "Controle financeiro completo do seu negócio",
        emoji: "💰",
        cor: "from-amber-500 to-orange-600",
        cursoIds: ["2", "4", "13", "11"],
    },
    {
        titulo: "Crescimento Profissional",
        descricao: "Habilidades para fazer seu negócio escalar",
        emoji: "🚀",
        cor: "from-violet-500 to-purple-600",
        cursoIds: ["3", "12", "14", "15"],
    },
];

export function CursosETreinamento() {
    const [mounted, setMounted] = useState(false);
    const [catFiltro, setCatFiltro] = useState("Todos");
    const [busca, setBusca] = useState("");
    const [concluidos, setConcluidos] = useState<Set<string>>(new Set());
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
    const [tab, setTab] = useState<"cursos" | "trilhas">("cursos");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedC = localStorage.getItem("emei-cursos-concluidos");
            const savedF = localStorage.getItem("emei-cursos-favoritos");
            if (savedC) setConcluidos(new Set(JSON.parse(savedC)));
            if (savedF) setFavoritos(new Set(JSON.parse(savedF)));
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("emei-cursos-concluidos", JSON.stringify([...concluidos]));
            localStorage.setItem("emei-cursos-favoritos", JSON.stringify([...favoritos]));
        }
    }, [concluidos, favoritos, mounted]);

    if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

    const toggleConcluido = (id: string) => {
        const next = new Set(concluidos);
        next.has(id) ? next.delete(id) : next.add(id);
        setConcluidos(next);
    };
    const toggleFavorito = (id: string) => {
        const next = new Set(favoritos);
        next.has(id) ? next.delete(id) : next.add(id);
        setFavoritos(next);
    };

    const filtered = cursos.filter((c) => {
        const matchCat = catFiltro === "Todos" || c.categoria === catFiltro;
        const matchBusca = !busca || c.titulo.toLowerCase().includes(busca.toLowerCase()) || c.descricao.toLowerCase().includes(busca.toLowerCase());
        return matchCat && matchBusca;
    });

    const nivelLabel = { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" };
    const nivelColor = { iniciante: "bg-emerald-100 text-emerald-700", intermediario: "bg-amber-100 text-amber-700", avancado: "bg-red-100 text-red-700" };

    const pctGeral = cursos.length > 0 ? (concluidos.size / cursos.length) * 100 : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Cursos e Treinamento</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Capacite-se gratuitamente com cursos selecionados para MEIs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground">{concluidos.size}/{cursos.length} concluídos</div>
                        <div className="h-2 w-24 rounded-full bg-muted overflow-hidden mt-1">
                            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pctGeral}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-center">
                    <div className="text-2xl font-bold text-primary">{cursos.length}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Cursos</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center">
                    <div className="text-2xl font-bold text-emerald-700">{concluidos.size}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Concluídos</div>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-center">
                    <div className="text-2xl font-bold text-amber-700">{favoritos.size}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Salvos</div>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{cursos.filter((c) => c.gratis).length}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground">Gratuitos</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
                {([["cursos", "📚 Catálogo"], ["trilhas", "🛤️ Trilhas de Aprendizado"]] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)}
                        className={`px-4 py-2 text-sm font-bold border-b-2 -mb-px transition-all ${tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ═══ TRILHAS ═══ */}
            {tab === "trilhas" && (
                <div className="space-y-4">
                    {trilhas.map((trilha) => {
                        const trilhaCursos = trilha.cursoIds.map((id) => cursos.find((c) => c.id === id)!).filter(Boolean);
                        const concl = trilha.cursoIds.filter((id) => concluidos.has(id)).length;
                        const pct = (concl / trilha.cursoIds.length) * 100;
                        return (
                            <div key={trilha.titulo} className="rounded-2xl border border-border bg-card overflow-hidden">
                                <div className={`bg-gradient-to-r ${trilha.cor} p-5 text-white`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{trilha.emoji}</span>
                                            <div>
                                                <h3 className="text-lg font-bold">{trilha.titulo}</h3>
                                                <p className="text-sm opacity-90">{trilha.descricao}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold">{concl}/{trilha.cursoIds.length}</div>
                                            <div className="text-xs opacity-80">concluídos</div>
                                        </div>
                                    </div>
                                    <div className="h-2 rounded-full bg-white/20 mt-4 overflow-hidden">
                                        <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                                <div className="divide-y divide-border">
                                    {trilhaCursos.map((curso, idx) => (
                                        <div key={curso.id} className="flex items-center gap-3 px-5 py-3">
                                            <button onClick={() => toggleConcluido(curso.id)}
                                                className={`h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${concluidos.has(curso.id) ? "bg-primary border-primary text-white" : "border-border"}`}>
                                                {concluidos.has(curso.id) ? "✓" : <span className="text-xs text-muted-foreground">{idx + 1}</span>}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${concluidos.has(curso.id) ? "line-through text-muted-foreground" : ""}`}>{curso.titulo}</p>
                                                <p className="text-[11px] text-muted-foreground">{curso.fonte} · {curso.duracao}</p>
                                            </div>
                                            <a href={curso.url} target="_blank" rel="noopener noreferrer"
                                                className="shrink-0 text-xs font-bold text-primary hover:underline">
                                                Acessar →
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ═══ CATÁLOGO ═══ */}
            {tab === "cursos" && (
                <div className="space-y-4">
                    {/* Busca e filtros */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cursos..."
                                className="w-full rounded-xl border border-border bg-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {categorias.map((cat) => (
                            <button key={cat} onClick={() => setCatFiltro(cat)}
                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${catFiltro === cat ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-accent"}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Favoritos section */}
                    {favoritos.size > 0 && catFiltro === "Todos" && !busca && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                            <h3 className="text-sm font-bold flex items-center gap-2">⭐ Seus cursos salvos</h3>
                            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                                {cursos.filter((c) => favoritos.has(c.id)).map((curso) => (
                                    <a key={curso.id} href={curso.url} target="_blank" rel="noopener noreferrer"
                                        className="shrink-0 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-medium hover:shadow-md transition-all">
                                        {curso.emoji} {curso.titulo}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Course grid */}
                    {filtered.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                            Nenhum curso encontrado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((curso) => {
                                const done = concluidos.has(curso.id);
                                const fav = favoritos.has(curso.id);
                                return (
                                    <div key={curso.id} className={`rounded-2xl border bg-card p-4 transition-all hover:shadow-md group ${done ? "border-primary/20 bg-primary/5" : "border-border"}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl mt-0.5">{curso.emoji}</span>
                                                <div>
                                                    <h4 className="text-sm font-bold leading-tight">{curso.titulo}</h4>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{curso.descricao}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => toggleFavorito(curso.id)} className={`shrink-0 text-sm transition-all ${fav ? "text-amber-500" : "text-muted-foreground/30 hover:text-amber-400"}`}>
                                                {fav ? "★" : "☆"}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{curso.fonte}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nivelColor[curso.nivel]}`}>{nivelLabel[curso.nivel]}</span>
                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">⏱ {curso.duracao}</span>
                                                {curso.gratis && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Grátis</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                                            <button onClick={() => toggleConcluido(curso.id)}
                                                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-all ${done ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"}`}>
                                                {done ? "✓ Concluído" : "Marcar concluído"}
                                            </button>
                                            <a href={curso.url} target="_blank" rel="noopener noreferrer"
                                                className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                                                Acessar curso
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Fontes */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <h3 className="text-sm font-bold">🏫 Plataformas de Cursos Gratuitos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { nome: "SEBRAE", url: "https://sebrae.com.br/sites/PortalSebrae/cursosonline", emoji: "🟢" },
                        { nome: "FGV Online", url: "https://educacao.fgv.br/cursos/gratuitos", emoji: "🔵" },
                        { nome: "SENAC EAD", url: "https://www.ead.senac.br/cursos-gratuitos/", emoji: "🟠" },
                        { nome: "SENAI", url: "https://www.futuro.digital/", emoji: "🔴" },
                        { nome: "Microsoft Learn", url: "https://learn.microsoft.com/pt-br/training/", emoji: "🟣" },
                        { nome: "Google Skillshop", url: "https://skillshop.withgoogle.com/", emoji: "🟡" },
                        { nome: "Banco Central", url: "https://www.bcb.gov.br/cidadaniafinanceira/cursos", emoji: "🏦" },
                        { nome: "Gov.br MEI", url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor", emoji: "🇧🇷" },
                    ].map((p) => (
                        <a key={p.nome} href={p.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium hover:border-primary/40 hover:bg-primary/5 transition-all group">
                            <span>{p.emoji}</span>
                            <span className="group-hover:text-primary transition-colors text-xs">{p.nome}</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
