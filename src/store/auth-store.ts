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
                        if (data.financeiro) useFinanceiroStore.setState(data.financeiro);
                    } else {
                        // First time login, push local data to remote
                        await setDoc(userRef, {
                            empresa: useEmpresaStore.getState().empresa,
                            clientes: useClientesStore.getState().clientes,
                            financeiro: useFinanceiroStore.getState(),
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

// Real-time outward sync
// Note: Debouncing these in a production app is ideal, but for test/demonstration it syncs per change.
useEmpresaStore.subscribe((state) => {
    const user = useAuthStore.getState().user;
    if (user) {
        setDoc(doc(db, "users", user.uid), { empresa: state.empresa }, { merge: true }).catch(console.error);
    }
});

useClientesStore.subscribe((state) => {
    const user = useAuthStore.getState().user;
    if (user) {
        setDoc(doc(db, "users", user.uid), { clientes: state.clientes }, { merge: true }).catch(console.error);
    }
});

useFinanceiroStore.subscribe((state) => {
    const user = useAuthStore.getState().user;
    if (user) {
        setDoc(doc(db, "users", user.uid), { financeiro: state }, { merge: true }).catch(console.error);
    }
});
