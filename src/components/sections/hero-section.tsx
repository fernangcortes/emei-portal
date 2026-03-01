"use client";

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
    return (
        <section className="relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 right-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-mei-gold/10 blur-3xl" />
                <div className="absolute top-1/2 right-0 w-72 h-72 rounded-full bg-blue-100/30 blur-3xl" />
            </div>

            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                {/* Hero text */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>
                        Guia completo e gratuito
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Seu portal{" "}
                        <span className="text-primary">MEI</span>
                        <br />
                        <span className="text-muted-foreground font-medium">
                            completo e interativo.
                        </span>
                    </h1>

                    <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Tudo que você precisa para abrir, gerenciar e manter seu
                        Microempreendedor Individual em um só lugar.
                    </p>

                    {/* Stats */}
                    <div className="mt-10 flex justify-center gap-8 sm:gap-12">
                        {[
                            { value: "5", label: "Passos simples" },
                            { value: "R$0", label: "Para abrir" },
                            { value: "~15min", label: "Tempo médio" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <div className="text-2xl sm:text-3xl font-bold text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {areas.map((area) => (
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
                            <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${area.titleColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                Acessar
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
