import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    auth: {
        token: string | null;
        userId: number | null;
    }
    setAuth: (auth: AuthState["auth"]) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            auth: {
                token: null,
                userId: null,
            },
            setAuth: (
                auth: {
                    token: string | null,
                    userId: number | null
                }
            ) => set({ auth })
        }),
        {
            name: "auth-storage",
        }
    )
);