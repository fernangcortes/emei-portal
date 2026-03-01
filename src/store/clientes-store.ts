import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Cliente {
    id: string;
    nome: string;
    cpfCnpj: string;
    email: string;
    telefone: string;
    endereco: string;
    notas: string;
    criadoEm: string;
}

interface ClientesState {
    clientes: Cliente[];
    addCliente: (c: Omit<Cliente, "id" | "criadoEm">) => void;
    updateCliente: (id: string, data: Partial<Cliente>) => void;
    removeCliente: (id: string) => void;
}

const genId = () => Math.random().toString(36).slice(2, 10);

export const useClientesStore = create<ClientesState>()(
    persist(
        (set) => ({
            clientes: [],
            addCliente: (c) =>
                set((s) => ({
                    clientes: [{ ...c, id: genId(), criadoEm: new Date().toISOString().slice(0, 10) }, ...s.clientes],
                })),
            updateCliente: (id, data) =>
                set((s) => ({
                    clientes: s.clientes.map((c) => (c.id === id ? { ...c, ...data } : c)),
                })),
            removeCliente: (id) =>
                set((s) => ({ clientes: s.clientes.filter((c) => c.id !== id) })),
        }),
        { name: "emei-clientes" }
    )
);
