import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
    geminiApiKey: string;
    setGeminiApiKey: (key: string) => void;
}

export const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            geminiApiKey: "",
            setGeminiApiKey: (key) => set({ geminiApiKey: key }),
        }),
        { name: "emei-config" }
    )
);
