import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EmpresaData {
    cnpj: string;
    razaoSocial: string;
    dataAbertura: string;
    cnaePrincipal: string;
    cnaesSecundarios: string[];
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
    };
    telefone: string;
    email: string;
    capitalSocial: string;
    tipoAtividade: "comercio" | "servico" | "ambos";
}

interface EmpresaState {
    empresa: EmpresaData;
    updateEmpresa: (data: Partial<EmpresaData>) => void;
    updateEndereco: (data: Partial<EmpresaData["endereco"]>) => void;
    resetEmpresa: () => void;
}

const defaultEmpresa: EmpresaData = {
    cnpj: "",
    razaoSocial: "",
    dataAbertura: "",
    cnaePrincipal: "",
    cnaesSecundarios: [],
    endereco: {
        cep: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
    },
    telefone: "",
    email: "",
    capitalSocial: "",
    tipoAtividade: "servico",
};

export const useEmpresaStore = create<EmpresaState>()(
    persist(
        (set) => ({
            empresa: defaultEmpresa,
            updateEmpresa: (data) =>
                set((state) => ({
                    empresa: { ...state.empresa, ...data },
                })),
            updateEndereco: (data) =>
                set((state) => ({
                    empresa: {
                        ...state.empresa,
                        endereco: { ...state.empresa.endereco, ...data },
                    },
                })),
            resetEmpresa: () => set({ empresa: defaultEmpresa }),
        }),
        { name: "emei-empresa" }
    )
);
