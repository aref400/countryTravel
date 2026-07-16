import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./auth.store";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  username: "tester",
  role: "user",
};

describe("auth.store", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("setAuth stocke le token en localStorage et met à jour le state (régression BUG-02)", () => {
    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    expect(localStorage.getItem("token")).toBe("access-token-123");
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().accessToken).toBe("access-token-123");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-token-123");
  });

  it("isAuthenticated() reflète la présence d'un accessToken", () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);

    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("setTokens remplace le couple de tokens sans toucher au user (refresh silencieux)", () => {
    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    useAuthStore.getState().setTokens("access-token-456", "refresh-token-456");

    expect(localStorage.getItem("token")).toBe("access-token-456");
    expect(useAuthStore.getState().accessToken).toBe("access-token-456");
    expect(useAuthStore.getState().refreshToken).toBe("refresh-token-456");
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it("logout supprime le token du localStorage et réinitialise le state", () => {
    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    useAuthStore.getState().logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });

  it("logout redirige vers la page d'accueil", () => {
    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    useAuthStore.getState().logout();

    expect(window.location.href).toBe("/");
  });

  it("expireSession vide le state et redirige vers le login avec ?expired=1 (BUG-10)", () => {
    useAuthStore
      .getState()
      .setAuth(mockUser, "access-token-123", "refresh-token-123");

    useAuthStore.getState().expireSession();

    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(window.location.href).toBe("/auth/login?expired=1");
  });
});
