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
    useAuthStore.setState({ user: null, accessToken: null });
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
    useAuthStore.getState().setAuth(mockUser, "access-token-123");

    expect(localStorage.getItem("token")).toBe("access-token-123");
    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().accessToken).toBe("access-token-123");
  });

  it("isAuthenticated() reflète la présence d'un accessToken", () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);

    useAuthStore.getState().setAuth(mockUser, "access-token-123");

    expect(useAuthStore.getState().isAuthenticated()).toBe(true);
  });

  it("logout supprime le token du localStorage et réinitialise le state", () => {
    useAuthStore.getState().setAuth(mockUser, "access-token-123");

    useAuthStore.getState().logout();

    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it("logout redirige vers la page d'accueil", () => {
    useAuthStore.getState().setAuth(mockUser, "access-token-123");

    useAuthStore.getState().logout();

    expect(window.location.href).toBe("/");
  });
});
