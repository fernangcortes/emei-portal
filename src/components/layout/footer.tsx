export function Footer() {
    return (
        <footer className="border-t border-border/60 bg-muted/30">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                                M
                            </div>
                            <span className="font-bold">
                                e<span className="text-primary">MEI</span>
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Portal educacional para auxiliar microempreendedores individuais
                            em todas as etapas da formalização e gestão do MEI.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3">Links Importantes</h3>
                        <ul className="space-y-2">
                            {[
                                {
                                    label: "Portal do Empreendedor",
                                    href: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
                                },
                                {
                                    label: "PGMEI (Pagamento DAS)",
                                    href: "http://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao",
                                },
                                {
                                    label: "Emissor Nacional NFS-e",
                                    href: "https://www.nfse.gov.br/EmissorNacional",
                                },
                            ].map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-muted-foreground hover:text-primary transition-smooth"
                                    >
                                        {link.label} ↗
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3">Aviso Legal</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Este portal é um projeto educacional e não substitui serviços
                            contábeis profissionais. As informações são baseadas na legislação
                            vigente e documentos oficiais.
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border/60 text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} eMEI — Portal do Microempreendedor.
                        Feito com 💚 para facilitar a vida do MEI brasileiro.
                    </p>
                </div>
            </div>
        </footer>
    );
}
