import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  logout(): Promise<void>;
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
      logout: async () => {
        // Révocation côté serveur (best-effort) : invalide le refresh token en
        // base (refreshTokenHash → null). On appelle AVANT de vider le token,
        // car le JwtAuthGuard a besoin de l'Authorization header.
        // fetch brut (pas apiClient) pour éviter le cycle d'imports avec
        // fetch.instance, comme le fait déjà refreshSession.
        const token = localStorage.getItem("token");
        if (token) {
          try {
            await fetch(`${API_URL}/v1/auth/logout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
          } catch {
            // Serveur/réseau injoignable : on déconnecte quand même en local.
          }
        }
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
