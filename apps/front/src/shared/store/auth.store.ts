import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: () => boolean;
  setAuth(user: User, accessToken: string, refreshToken: string): void;
  setTokens(accessToken: string, refreshToken: string): void;
  logout(): void;
  expireSession(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: () => !!get().accessToken,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem("token", accessToken);
        set({ user, accessToken, refreshToken });
      },
      // Mise à jour du couple de tokens après un refresh silencieux,
      // sans toucher au user
      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem("token", accessToken);
        set({ accessToken, refreshToken });
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem("token");
        window.location.href = "/";
      },
      // Déconnexion subie (session expirée) : contrairement à logout,
      // on renvoie vers le login avec un message explicatif
      expireSession: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        localStorage.removeItem("token");
        window.location.href = "/auth/login?expired=1";
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
