import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RecoFormDto, SaveRecommendation } from "../types";
import { postRecommendation, saveRecommendation } from "./recommendations.service";

const form: RecoFormDto = {
  budget: 3,
  safety: 4,
  temperature: 3,
  familyFriendly: true,
  natureLevel: 5,
  partyLevel: 2,
  sportLevel: 3,
  cultureLevel: 4,
  historyLevel: 4,
  gastronomyLevel: 5,
  cityLevel: 2,
  relaxationLevel: 3,
};

describe("recommendations.service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("postRecommendation envoie le formulaire en POST vers /v1/recommendations/compute", async () => {
    const mockResults = [{ rank: 1, score: 92, country: { isoCode: "FRA" } }];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResults,
    } as Response);

    const result = await postRecommendation(form);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/recommendations/compute",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(form),
      }),
    );
    expect(result).toEqual(mockResults);
  });

  it("postRecommendation rejette avec le statut HTTP en cas d'erreur de validation (400)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Validation failed" }),
    } as Response);

    await expect(postRecommendation(form)).rejects.toMatchObject({
      status: 400,
    });
  });

  it("saveRecommendation envoie le POST vers /v1/recommendations/save avec le token d'auth si présent", async () => {
    localStorage.setItem("token", "fake-jwt");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "reco-1" }),
    } as Response);

    const payload: SaveRecommendation = {
      name: "Mon top 5",
      criteriaSnapshot: form,
      resultsSnapshot: [],
    };

    await saveRecommendation(payload);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/recommendations/save",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer fake-jwt" }),
      }),
    );

    localStorage.clear();
  });

  it("saveRecommendation rejette si l'utilisateur n'est pas authentifié (401)", async () => {
    localStorage.removeItem("token");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    } as Response);

    await expect(
      saveRecommendation({ criteriaSnapshot: form, resultsSnapshot: [] }),
    ).rejects.toMatchObject({ status: 401 });
  });
});
