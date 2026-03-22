import { create } from "zustand";
import { persist } from "zustand/middleware";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEmpresaStore } from "./empresa-store";
import { useClientesStore } from "./clientes-store";
import { useFinanceiroStore } from "./financeiro-store";

interface AuthState {
    user: { uid: string; displayName: string | null; email: string | null; photoURL: string | null } | null;
    setUser: (user: any | null) => void;
    syncData: () => Promise<void>;
}

// Helper: extract only serializable data from the financeiro store (no functions)
function getFinanceiroData() {
    const s = useFinanceiroStore.getState();
    return {
        transacoes: s.transacoes,
        metas: s.metas,
        contas: s.contas,
        dasHistorico: s.dasHistorico,
        orcamentos: s.orcamentos,
    };
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            setUser: (user) => set({ 
                user: user ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } : null 
            }),
            syncData: async () => {
                const { user } = get();
                if (!user) return;

                const userRef = doc(db, "users", user.uid);
                
                try {
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        // Import from remote if exists
                        if (data.empresa) useEmpresaStore.setState({ empresa: data.empresa });
                        if (data.clientes) useClientesStore.setState({ clientes: data.clientes });
                        if (data.financeiro) {
                            useFinanceiroStore.setState({
                                transacoes: data.financeiro.transacoes ?? [],
                                metas: data.financeiro.metas ?? [],
                                contas: data.financeiro.contas ?? [],
                                dasHistorico: data.financeiro.dasHistorico ?? [],
                                orcamentos: data.financeiro.orcamentos ?? [],
                            });
                        }
                    } else {
                        // First time login, push local data to remote
                        await setDoc(userRef, {
                            empresa: useEmpresaStore.getState().empresa,
                            clientes: useClientesStore.getState().clientes,
                            financeiro: getFinanceiroData(),
                            createdAt: new Date().toISOString()
                        }, { merge: true });
                    }
                } catch (err) {
                    console.error("Error syncing data with Firestore:", err);
                }
            }
        }),
        { name: "emei-auth" }
    )
);

// --- Real-time outward sync (debounced) ---
let syncTimeout: ReturnType<typeof setTimeout> | null = null;
function debouncedSync(payload: Record<string, unknown>) {
    const user = useAuthStore.getState().user;
    if (!user) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
        setDoc(doc(db, "users", user.uid), payload, { merge: true }).catch(console.error);
    }, 1500);
}

useEmpresaStore.subscribe((state) => {
    debouncedSync({ empresa: state.empresa });
});

useClientesStore.subscribe((state) => {
    debouncedSync({ clientes: state.clientes });
});

useFinanceiroStore.subscribe(() => {
    debouncedSync({ financeiro: getFinanceiroData() });
});
