import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SubTask {
  id: string;
  label: string;
  completed: boolean;
  url?: string;
}

export interface Step {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  subtasks: SubTask[];
  url?: string;
}

export interface ProgressState {
  steps: Step[];
  toggleSubtask: (stepId: string, subtaskId: string) => void;
  setSubtaskCompleted: (
    stepId: string,
    subtaskId: string,
    completed: boolean
  ) => void;
  getStepProgress: (stepId: string) => number;
  getTotalProgress: () => number;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  exportProgress: () => string;
  importProgress: (json: string) => boolean;
  resetProgress: () => void;
}

const initialSteps: Step[] = [
  {
    id: "gov-br",
    number: 1,
    title: "Criar Conta Gov.br",
    description:
      "Crie ou atualize sua conta no Gov.br para o nível Prata ou Ouro. Isso é necessário para acessar os serviços do governo.",
    icon: "shield-check",
    url: "https://sso.acesso.gov.br",
    subtasks: [
      {
        id: "gov-br-1",
        label: "Acessar o site gov.br/conta",
        completed: false,
        url: "https://sso.acesso.gov.br",
      },
      {
        id: "gov-br-2",
        label: "Criar conta ou fazer login",
        completed: false,
        url: "https://sso.acesso.gov.br/login",
      },
      {
        id: "gov-br-3",
        label: "Elevar a conta para nível Prata ou Ouro (validação facial ou banco)",
        completed: false,
        url: "https://confiabilidades.acesso.gov.br",
      },
      {
        id: "gov-br-4",
        label: "Anotar o CPF e senha usados",
        completed: false,
      },
    ],
  },
  {
    id: "atividades",
    number: 2,
    title: "Definir Atividades (CNAEs)",
    description:
      "Escolha as atividades econômicas que você vai exercer como MEI. Selecione 1 atividade principal e até 14 secundárias.",
    icon: "briefcase",
    url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas",
    subtasks: [
      {
        id: "ativ-1",
        label: "Pesquisar os CNAEs permitidos para MEI",
        completed: false,
        url: "https://concla.ibge.gov.br/busca-online-cnae.html",
      },
      {
        id: "ativ-2",
        label: "Selecionar 1 CNAE principal (atividade que mais gera receita)",
        completed: false,
      },
      {
        id: "ativ-3",
        label: "Selecionar CNAEs secundários (se necessário, até 14)",
        completed: false,
      },
      {
        id: "ativ-4",
        label: "Verificar se a atividade exige alvará ou licença específica",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/redesim",
      },
    ],
  },
  {
    id: "formulario",
    number: 3,
    title: "Preencher o Formulário",
    description:
      "Acesse o Portal do Empreendedor e preencha o formulário de inscrição do MEI com seus dados pessoais e da empresa.",
    icon: "file-text",
    url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/formalize-se",
    subtasks: [
      {
        id: "form-1",
        label: "Acessar o Portal do Empreendedor (gov.br/mei)",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      },
      {
        id: "form-2",
        label: "Clicar em 'Quero ser MEI' → 'Formalize-se'",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/formalize-se",
      },
      {
        id: "form-3",
        label: "Preencher dados pessoais (RG, título de eleitor ou declaração IR)",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/formalize-se",
      },
      {
        id: "form-4",
        label: "Informar endereço residencial e comercial",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/formalize-se",
      },
      {
        id: "form-5",
        label: "Preencher os CNAEs escolhidos no passo anterior",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/formalize-se",
      },
    ],
  },
  {
    id: "ccmei",
    number: 4,
    title: "Emitir o CCMEI",
    description:
      "O Certificado da Condição de Microempreendedor Individual (CCMEI) é o seu 'CNPJ'. Imprima e guarde!",
    icon: "award",
    url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/emissao-de-comprovante-ccmei",
    subtasks: [
      {
        id: "ccmei-1",
        label: "Confirmar os dados e aceitar os termos",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/emissao-de-comprovante-ccmei",
      },
      {
        id: "ccmei-2",
        label: "Gerar o CCMEI com número do CNPJ",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/emissao-de-comprovante-ccmei",
      },
      {
        id: "ccmei-3",
        label: "Salvar o CCMEI em PDF",
        completed: false,
        url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos/emissao-de-comprovante-ccmei",
      },
      {
        id: "ccmei-4",
        label: "Imprimir e guardar uma cópia física",
        completed: false,
      },
    ],
  },
  {
    id: "pos-abertura",
    number: 5,
    title: "Configurações Pós-Abertura",
    description:
      "Após abrir o MEI, configure os acessos essenciais para emitir notas fiscais e pagar seus impostos.",
    icon: "settings",
    url: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/servicos",
    subtasks: [
      {
        id: "pos-1",
        label: "Acessar o Emissor Nacional de NFS-e e fazer o primeiro login",
        completed: false,
        url: "https://www.nfse.gov.br/EmissorNacional",
      },
      {
        id: "pos-2",
        label: "Configurar os dados de emissão de nota fiscal",
        completed: false,
        url: "https://www.nfse.gov.br/EmissorNacional",
      },
      {
        id: "pos-3",
        label: "Acessar o PGMEI para gerar o primeiro boleto DAS",
        completed: false,
        url: "http://www8.receita.fazenda.gov.br/simplesnacional/aplicacoes/atspo/pgmei.app/identificacao",
      },
      {
        id: "pos-4",
        label: "Anotar as datas de vencimento mensal do DAS (dia 20)",
        completed: false,
      },
      {
        id: "pos-5",
        label: "Verificar se precisa de inscrição estadual (para comércio/indústria)",
        completed: false,
        url: "https://www.gov.br/economia/pt-br/assuntos/drei/juntas-comerciais",
      },
    ],
  },
];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      steps: initialSteps,

      toggleSubtask: (stepId: string, subtaskId: string) => {
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId
              ? {
                ...step,
                subtasks: step.subtasks.map((st) =>
                  st.id === subtaskId
                    ? { ...st, completed: !st.completed }
                    : st
                ),
              }
              : step
          ),
        }));
      },

      setSubtaskCompleted: (
        stepId: string,
        subtaskId: string,
        completed: boolean
      ) => {
        set((state) => ({
          steps: state.steps.map((step) =>
            step.id === stepId
              ? {
                ...step,
                subtasks: step.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, completed } : st
                ),
              }
              : step
          ),
        }));
      },

      getStepProgress: (stepId: string) => {
        const step = get().steps.find((s) => s.id === stepId);
        if (!step || step.subtasks.length === 0) return 0;
        const completed = step.subtasks.filter((st) => st.completed).length;
        return Math.round((completed / step.subtasks.length) * 100);
      },

      getTotalProgress: () => {
        const { getCompletedCount, getTotalCount } = get();
        const total = getTotalCount();
        if (total === 0) return 0;
        return Math.round((getCompletedCount() / total) * 100);
      },

      getCompletedCount: () => {
        return get().steps.reduce(
          (acc, step) =>
            acc + step.subtasks.filter((st) => st.completed).length,
          0
        );
      },

      getTotalCount: () => {
        return get().steps.reduce(
          (acc, step) => acc + step.subtasks.length,
          0
        );
      },

      exportProgress: () => {
        const state = get();
        const exportData = {
          version: 1,
          exportedAt: new Date().toISOString(),
          steps: state.steps.map((step) => ({
            id: step.id,
            subtasks: step.subtasks.map((st) => ({
              id: st.id,
              completed: st.completed,
            })),
          })),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importProgress: (json: string) => {
        try {
          const data = JSON.parse(json);
          if (!data.steps || !Array.isArray(data.steps)) return false;

          set((state) => ({
            steps: state.steps.map((step) => {
              const imported = data.steps.find(
                (s: { id: string }) => s.id === step.id
              );
              if (!imported) return step;
              return {
                ...step,
                subtasks: step.subtasks.map((st) => {
                  const importedSt = imported.subtasks?.find(
                    (ist: { id: string }) => ist.id === st.id
                  );
                  return importedSt
                    ? { ...st, completed: importedSt.completed }
                    : st;
                }),
              };
            }),
          }));
          return true;
        } catch {
          return false;
        }
      },

      resetProgress: () => {
        set({
          steps: initialSteps.map((step) => ({
            ...step,
            subtasks: step.subtasks.map((st) => ({ ...st, completed: false })),
          })),
        });
      },
    }),
    {
      name: "emei-progress",
      version: 2,
    }
  )
);
