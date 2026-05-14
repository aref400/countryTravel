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
  isAuthenticated: () => boolean;
  setAuth(user: User, accessToken: string): void;
  logout(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: () => !!get().accessToken,
      setAuth: (user, accessToken) => {
        localStorage.setItem("token", accessToken);
        set({ user, accessToken });
      },
      logout: () => {
        set({ user: null, accessToken: null });
        localStorage.removeItem("token");
        window.location.href = "/";
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);
