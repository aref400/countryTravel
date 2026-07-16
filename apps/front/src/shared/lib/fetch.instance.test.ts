import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/shared/store/auth.store";
import { apiClient } from "./fetch.instance";

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  username: "tester",
  role: "user",
};

const jsonResponse = (status: number, data: unknown) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
});

describe("fetch.instance — refresh silencieux sur 401 (BUG-10)", () => {
  const originalLocation = window.location;
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("rafraîchit les tokens et rejoue la requête après un 401", async () => {
    useAuthStore.getState().setAuth(mockUser, "expired-token", "refresh-ok");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(
        jsonResponse(200, { accessToken: "new-access", refreshToken: "new-refresh" }),
      )
      .mockResolvedValueOnce(jsonResponse(200, [{ id: "visit-1" }]));

    const result = await apiClient.get("/v1/users/me/visits");

    expect(result).toEqual([{ id: "visit-1" }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/v1/auth/refresh");
    expect(useAuthStore.getState().accessToken).toBe("new-access");
    expect(localStorage.getItem("token")).toBe("new-access");
  });

  it("déconnecte proprement (redirect ?expired=1) si le refresh échoue aussi", async () => {
    useAuthStore.getState().setAuth(mockUser, "expired-token", "refresh-dead");
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(jsonResponse(401, { message: "Invalid refresh token" }));

    await expect(apiClient.get("/v1/users/me/visits")).rejects.toMatchObject({
      status: 401,
    });
    expect(window.location.href).toBe("/auth/login?expired=1");
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
  });

  it("ne tente pas de refresh sur un 401 des endpoints d'auth (mauvais mot de passe)", async () => {
    useAuthStore.getState().setAuth(mockUser, "valid-token", "refresh-ok");
    fetchMock.mockResolvedValueOnce(
      jsonResponse(401, { message: "Invalid password" }),
    );

    await expect(
      apiClient.post("/v1/auth/login", { email: "a@a.fr", password: "x" }),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("");
  });

  it("ne tente pas de refresh pour un visiteur non connecté", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: "Unauthorized" }));

    await expect(apiClient.get("/v1/reviews/me")).rejects.toMatchObject({
      status: 401,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("");
  });
});
