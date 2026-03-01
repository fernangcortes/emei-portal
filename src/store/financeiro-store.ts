import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transacao {
    id: string;
    tipo: "receita" | "despesa";
    valor: number;
    descricao: string;
    categoria: string;
    cliente?: string;
    data: string; // YYYY-MM-DD
    pago: boolean;
    formaPagamento?: "pix" | "dinheiro" | "cartao" | "boleto" | "transferencia" | "outro";
    recorrente?: boolean;
    tags?: string[];
    notas?: string;
}

export interface MetaFinanceira {
    id: string;
    titulo: string;
    valorAlvo: number;
    prazo: string; // YYYY-MM-DD
}

export interface ContaPendenteItem {
    id: string;
    tipo: "receber" | "pagar";
    descricao: string;
    valor: number;
    vencimento: string;
    cliente?: string;
    pago: boolean;
}

export interface DasStatus {
    mes: string; // YYYY-MM
    pago: boolean;
    dataPagamento?: string;
}

export interface OrcamentoMensal {
    categoria: string;
    limite: number;
}

interface FinanceiroState {
    transacoes: Transacao[];
    metas: MetaFinanceira[];
    contas: ContaPendenteItem[];
    dasHistorico: DasStatus[];
    orcamentos: OrcamentoMensal[];
    addTransacao: (t: Omit<Transacao, "id">) => void;
    removeTransacao: (id: string) => void;
    updateTransacao: (id: string, data: Partial<Transacao>) => void;
    addMeta: (m: Omit<MetaFinanceira, "id">) => void;
    removeMeta: (id: string) => void;
    addConta: (c: Omit<ContaPendenteItem, "id">) => void;
    removeConta: (id: string) => void;
    toggleContaPaga: (id: string) => void;
    toggleDas: (mes: string) => void;
    setOrcamentos: (o: OrcamentoMensal[]) => void;
    resetFinanceiro: () => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

export const useFinanceiroStore = create<FinanceiroState>()(
    persist(
        (set) => ({
            transacoes: [],
            metas: [],
            contas: [],
            dasHistorico: [],
            orcamentos: [],

            addTransacao: (t) =>
                set((s) => ({
                    transacoes: [{ ...t, id: genId() }, ...s.transacoes],
                })),
            removeTransacao: (id) =>
                set((s) => ({
                    transacoes: s.transacoes.filter((t) => t.id !== id),
                })),
            updateTransacao: (id, data) =>
                set((s) => ({
                    transacoes: s.transacoes.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                })),

            addMeta: (m) =>
                set((s) => ({ metas: [{ ...m, id: genId() }, ...s.metas] })),
            removeMeta: (id) =>
                set((s) => ({ metas: s.metas.filter((m) => m.id !== id) })),

            addConta: (c) =>
                set((s) => ({ contas: [{ ...c, id: genId() }, ...s.contas] })),
            removeConta: (id) =>
                set((s) => ({ contas: s.contas.filter((c) => c.id !== id) })),
            toggleContaPaga: (id) =>
                set((s) => ({
                    contas: s.contas.map((c) =>
                        c.id === id ? { ...c, pago: !c.pago } : c
                    ),
                })),

            toggleDas: (mes) =>
                set((s) => {
                    const exists = s.dasHistorico.find((d) => d.mes === mes);
                    if (exists) {
                        return {
                            dasHistorico: s.dasHistorico.map((d) =>
                                d.mes === mes ? { ...d, pago: !d.pago } : d
                            ),
                        };
                    }
                    return {
                        dasHistorico: [
                            ...s.dasHistorico,
                            { mes, pago: true, dataPagamento: new Date().toISOString().slice(0, 10) },
                        ],
                    };
                }),

            setOrcamentos: (o) => set({ orcamentos: o }),

            resetFinanceiro: () =>
                set({ transacoes: [], metas: [], contas: [], dasHistorico: [], orcamentos: [] }),
        }),
        { name: "emei-financeiro" }
    )
);
