"use client";

import { useProgressStore } from "@/store/progress-store";
import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";

export function GlobalProgressBar() {
    const [mounted, setMounted] = useState(false);
    const steps = useProgressStore((s) => s.steps);
    const exportProgress = useProgressStore((s) => s.exportProgress);
    const importProgress = useProgressStore((s) => s.importProgress);
    const resetProgress = useProgressStore((s) => s.resetProgress);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    // Compute derived values directly from steps to ensure reactivity
    const total = steps.reduce((acc, step) => acc + step.subtasks.length, 0);
    const completed = steps.reduce(
        (acc, step) => acc + step.subtasks.filter((st) => st.completed).length,
        0
    );
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    if (!mounted) {
        return (
            <div className="rounded-2xl border border-border/60 bg-card p-6 animate-pulse">
                <div className="h-4 w-48 rounded bg-muted mb-4" />
                <div className="h-3 w-full rounded-full bg-muted" />
            </div>
        );
    }

    const handleExport = () => {
        const json = exportProgress();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `meu-progresso-mei-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const success = importProgress(text);
            if (success) {
                setImportSuccess(true);
                setImportError(false);
                setTimeout(() => setImportSuccess(false), 3000);
            } else {
                setImportError(true);
                setImportSuccess(false);
                setTimeout(() => setImportError(false), 3000);
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getProgressColor = () => {
        if (progress === 100) return "bg-mei-green";
        if (progress >= 60) return "bg-primary";
        if (progress >= 30) return "bg-mei-gold";
        return "bg-primary";
    };

    const getProgressEmoji = () => {
        if (progress === 100) return "🎉";
        if (progress >= 75) return "🔥";
        if (progress >= 50) return "💪";
        if (progress >= 25) return "🚀";
        return "📋";
    };

    const getProgressMessage = () => {
        if (progress === 100) return "Parabéns! Você completou toda a jornada!";
        if (progress >= 75) return "Quase lá! Falta pouco para completar.";
        if (progress >= 50) return "Mais da metade concluída! Continue assim.";
        if (progress >= 25) return "Bom progresso! Mantenha o ritmo.";
        if (progress > 0) return "Boa! Você já começou sua jornada.";
        return "Comece marcando as etapas abaixo.";
    };

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span>{getProgressEmoji()}</span>
                        Seu Progresso
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {getProgressMessage()}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        className="text-xs gap-1.5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Salvar Progresso
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs gap-1.5"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Abrir Progresso
                    </Button>
                    {progress > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetProgress}
                            className="text-xs text-muted-foreground hover:text-destructive"
                        >
                            Resetar
                        </Button>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
                <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${getProgressColor()}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                        {completed} de {total} tarefas concluídas
                    </span>
                    <span className="text-sm font-bold text-primary tabular-nums">
                        {progress}%
                    </span>
                </div>
            </div>

            {/* Status messages */}
            {importSuccess && (
                <div className="mt-3 rounded-lg bg-mei-green-light p-3 text-sm text-mei-green-dark font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    ✅ Progresso importado com sucesso!
                </div>
            )}
            {importError && (
                <div className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                    ❌ Erro ao importar. Verifique se o arquivo é válido.
                </div>
            )}
        </div>
    );
}
