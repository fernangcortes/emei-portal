import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

// Configuração do Firebase usando variáveis de ambiente do Next.js
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy initialization — Firebase only starts when actually needed (on client)
// This prevents crashes during Next.js SSR/build when env vars are unavailable.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function getApp(): FirebaseApp {
    if (!_app) {
        if (!firebaseConfig.apiKey) {
            throw new Error("Firebase API Key não configurada. Verifique suas variáveis de ambiente.");
        }
        _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }
    return _app;
}

// Exported getters — safe to call from any component
export function getFirebaseAuth(): Auth {
    if (!_auth) _auth = getAuth(getApp());
    return _auth;
}

export function getFirebaseDb(): Firestore {
    if (!_db) _db = getFirestore(getApp());
    return _db;
}

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
        return result.user;
    } catch (error) {
        console.error("Erro ao fazer login com o Google:", error);
        throw error;
    }
};

export const logoutGoogle = async () => {
    try {
        await signOut(getFirebaseAuth());
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
};

// Re-export getter functions as the primary API
export { getFirebaseAuth as auth, getFirebaseDb as db };
