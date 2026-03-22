"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useProgressStore } from "@/store/progress-store";
import { loginWithGoogle, logoutGoogle } from "@/lib/firebase";
import { useAuthStore } from "@/store/auth-store";

export function Header() {
    const [mounted, setMounted] = useState(false);
    const steps = useProgressStore((s) => s.steps);
    const { user, setUser, syncData } = useAuthStore();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);
    const total = steps.reduce((acc, step) => acc + step.subtasks.length, 0);
    const completed = steps.reduce(
        (acc, step) => acc + step.subtasks.filter((st) => st.completed).length,
        0
    );
    const progress = mounted && total > 0 ? Math.round((completed / total) * 100) : 0;

    const handleLogin = async () => {
        setIsLoggingIn(true);
        try {
            const fbUser = await loginWithGoogle();
            setUser(fbUser);
            await syncData();
        } catch (error) {
            console.error(error);
            alert("Erro ao logar com Google. A chave de API do Firebase está configurada?");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        await logoutGoogle();
        setUser(null);
    };

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
                        <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-muted-foreground mr-2">
                            <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="tabular-nums">{progress}%</span>
                        </div>
                    )}

                    {mounted && user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-muted-foreground hidden sm:block">
                                Olá, {user.displayName?.split(" ")[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        mounted && (
                            <button
                                onClick={handleLogin}
                                disabled={isLoggingIn}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 shadow-sm hover:bg-gray-50 rounded-xl transition-colors text-gray-700 disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                </svg>
                                <span className="hidden sm:inline">{isLoggingIn ? "Autenticando..." : "Entrar com Google"}</span>
                                <span className="sm:hidden">{isLoggingIn ? "..." : "Entrar"}</span>
                            </button>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
