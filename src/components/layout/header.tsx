"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useProgressStore } from "@/store/progress-store";

export function Header() {
    const [mounted, setMounted] = useState(false);
    const steps = useProgressStore((s) => s.steps);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);
    const total = steps.reduce((acc, step) => acc + step.subtasks.length, 0);
    const completed = steps.reduce(
        (acc, step) => acc + step.subtasks.filter((st) => st.completed).length,
        0
    );
    const progress = mounted && total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm transition-smooth group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25">
                        M
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold leading-tight tracking-tight">
                            e<span className="text-primary">MEI</span>
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground leading-none -mt-0.5">
                            Portal do Microempreendedor
                        </span>
                    </div>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { href: "/jornada", label: "Jornada" },
                        { href: "/cnaes", label: "CNAEs" },
                        { href: "/o-que-e-mei", label: "O que é MEI" },
                        { href: "/sites-uteis", label: "Sites Úteis" },
                        { href: "/ja-sou-mei", label: "Já sou MEI" },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground hover:bg-accent transition-smooth"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    {mounted && progress > 0 && (
                        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="tabular-nums">{progress}%</span>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
