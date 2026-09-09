import { useAuthStore } from "@/shared/store/auth.store";
import { API_BASE_URL as BASE_URL } from "./api.config";

// Erreur normalisée levée par apiClient (voir request()).
export interface ApiError {
  status: number;
  data?: { message?: string | string[] };
}

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Une seule requête de refresh en vol : les appels concurrents qui reçoivent
// un 401 au même moment partagent la même promesse au lieu d'empiler les refresh
let refreshPromise: Promise<boolean> | null = null;

const refreshSession = (): Promise<boolean> => {
  refreshPromise ??= (async () => {
    const { refreshToken, setTokens } = useAuthStore.getState();
    if (!refreshToken) return false;
    try {
      // fetch brut (pas apiClient) pour ne pas re-déclencher la logique 401
      const response = await fetch(`${BASE_URL}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const tokens = (await response.json()) as {
        accessToken: string;
        refreshToken: string;
      };
      setTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

const request = async <T>(
  method: string,
  path: string,
  body?: unknown,
  isRetry = false,
): Promise<T> => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  // Session expirée (401 sur un appel authentifié, hors endpoints d'auth où
  // un 401 signifie "mauvais identifiants") : refresh silencieux puis rejeu
  // de la requête une seule fois ; en dernier recours, déconnexion propre
  // avec message (BUG-10)
  if (
    response.status === 401 &&
    !isRetry &&
    !path.startsWith("/v1/auth/") &&
    useAuthStore.getState().isAuthenticated()
  ) {
    if (await refreshSession()) {
      return request<T>(method, path, body, true);
    }
    useAuthStore.getState().expireSession();
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { status: response.status, data: error };
  }

  // 204 No Content (ex. DELETE) : pas de corps à parser.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
