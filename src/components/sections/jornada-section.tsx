"use client";

import { GlobalProgressBar } from "@/components/jornada/global-progress-bar";
import { Timeline } from "@/components/jornada/timeline";

export function JornadaSection() {
    return (
        <section id="jornada" className="scroll-mt-20">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Jornada de <span className="text-primary">Abertura</span>
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                        Siga cada passo, marque as subtarefas concluídas e acompanhe seu
                        progresso. Seu avanço é salvo automaticamente no navegador.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                    {/* Timeline */}
                    <div className="order-2 lg:order-1">
                        <Timeline />
                    </div>

                    {/* Sidebar with progress */}
                    <div className="order-1 lg:order-2">
                        <div className="lg:sticky lg:top-20">
                            <GlobalProgressBar />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
