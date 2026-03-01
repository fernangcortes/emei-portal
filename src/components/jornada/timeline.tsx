"use client";

import React, { useState, useEffect } from "react";
import { useProgressStore, type Step } from "@/store/progress-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ReactNode> = {
    "shield-check": (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
    ),
    briefcase: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect width="20" height="14" x="2" y="6" rx="2" /></svg>
    ),
    "file-text": (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></svg>
    ),
    award: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" /><circle cx="12" cy="8" r="6" /></svg>
    ),
    settings: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    ),
};

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
    const toggleSubtask = useProgressStore((s) => s.toggleSubtask);
    const [expanded, setExpanded] = useState(true);

    // Compute progress directly from step prop for proper reactivity
    const completedCount = step.subtasks.filter((st) => st.completed).length;
    const progress = step.subtasks.length === 0 ? 0 : Math.round((completedCount / step.subtasks.length) * 100);
    const allComplete = progress === 100;
    const hasStarted = progress > 0;

    return (
        <div className="relative flex gap-4 sm:gap-6">
            {/* Timeline line */}
            <div className="flex flex-col items-center gap-0">
                {/* Circle */}
                <div
                    className={`
            relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-all duration-500
            ${allComplete
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : hasStarted
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border bg-card text-muted-foreground"
                        }
          `}
                >
                    {allComplete ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    ) : (
                        <span className="text-sm font-bold">{step.number}</span>
                    )}
                </div>
                {/* Connector line */}
                {!isLast && (
                    <div className="relative w-0.5 flex-1 min-h-8">
                        <div className="absolute inset-0 bg-border" />
                        {hasStarted && (
                            <div
                                className="absolute inset-x-0 top-0 bg-primary transition-all duration-700 ease-out"
                                style={{ height: `${progress}%` }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-left group"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className={`text-base font-semibold transition-smooth ${allComplete ? "text-primary" : ""}`}>
                                    {step.title}
                                </h3>
                                {allComplete && (
                                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs translate-y-[1px]">
                                        Concluído ✓
                                    </Badge>
                                )}
                                {hasStarted && !allComplete && (
                                    <Badge variant="outline" className="text-xs tabular-nums translate-y-[1px]">
                                        {progress}%
                                    </Badge>
                                )}
                                {step.url && (
                                    <a
                                        href={step.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-smooth group-hover:shadow-sm"
                                    >
                                        Ir para o Portal
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                        {!step.url && (
                            <div className={`mt-1 shrink-0 p-1.5 rounded-lg transition-smooth ${allComplete ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                                {iconMap[step.icon] || iconMap["file-text"]}
                            </div>
                        )}
                    </div>
                </button>

                {/* Subtasks */}
                <div
                    className={`
        overflow-hidden transition-all duration-300 ease-out
        ${expanded ? "max-h-[800px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}
      `}
                >
                    {/* Mini progress bar */}
                    {hasStarted && (
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-4">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <ul className="space-y-2.5">
                        {step.subtasks.map((subtask) => (
                            <li key={subtask.id}>
                                <label
                                    className={`
                flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3 cursor-pointer transition-smooth
                hover:bg-accent/50 hover:border-primary/20
                ${subtask.completed ? "bg-primary/[0.03] border-primary/10" : "bg-card"}
              `}
                                >
                                    <Checkbox
                                        id={subtask.id}
                                        checked={subtask.completed}
                                        onCheckedChange={() => toggleSubtask(step.id, subtask.id)}
                                        className="shrink-0 h-5 w-5 rounded-md"
                                    />
                                    <span
                                        className={`text-sm leading-tight transition-smooth flex-1 ${subtask.completed
                                            ? "line-through text-muted-foreground"
                                            : "font-medium text-foreground/90"
                                            }`}
                                    >
                                        {subtask.label}
                                    </span>
                                    {subtask.url && (
                                        <a
                                            href={subtask.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="shrink-0 ml-2 inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                        >
                                            Acessar
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                        </a>
                                    )}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export function Timeline() {
    const [mounted, setMounted] = useState(false);
    const steps = useProgressStore((s) => s.steps);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-6 animate-pulse">
                        <div className="h-11 w-11 rounded-xl bg-muted shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-48 rounded bg-muted" />
                            <div className="h-4 w-full rounded bg-muted" />
                            <div className="h-4 w-3/4 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {steps.map((step, index) => (
                <StepCard
                    key={step.id}
                    step={step}
                    isLast={index === steps.length - 1}
                />
            ))}
        </div>
    );
}
