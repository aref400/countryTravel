import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RecoFormDto, RecommendationResponse } from "../types";
import { useRecommendations } from "./useRecommendations";

vi.mock("../services/recommendations.service", () => ({
  postRecommendation: vi.fn(),
}));

import { postRecommendation } from "../services/recommendations.service";

const form = {} as RecoFormDto;
const results: RecommendationResponse[] = [
  {
    rank: 1,
    score: 92,
    country: {
      isoCode: "FRA",
      name: "France",
      flagUrl: null,
      continent: "Europe",
      description: null,
    },
  },
];

describe("useRecommendations", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(postRecommendation).mockReset();
  });

  it("hydrate les résultats depuis le cache sessionStorage au montage", () => {
    sessionStorage.setItem("reco_results", JSON.stringify(results));

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.recommendations).toEqual(results);
  });

  it("ignore un cache JSON invalide et le supprime au lieu de planter (régression BUG-01)", () => {
    sessionStorage.setItem("reco_results", "{ceci n'est pas du JSON valide");

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.recommendations).toEqual([]);
    expect(sessionStorage.getItem("reco_results")).toBeNull();
  });

  it("computeRecommendations stocke le résultat en cache pour survivre à une navigation (régression BUG-03)", async () => {
    vi.mocked(postRecommendation).mockResolvedValue(results);
    const { result } = renderHook(() => useRecommendations());

    await act(async () => {
      await result.current.computeRecommendations(form);
    });

    expect(result.current.recommendations).toEqual(results);
    expect(JSON.parse(sessionStorage.getItem("reco_results")!)).toEqual(
      results,
    );
  });

  it("expose une erreur lisible si le calcul échoue", async () => {
    vi.mocked(postRecommendation).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useRecommendations());

    await act(async () => {
      await result.current.computeRecommendations(form);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Impossible de charger les recommandations.",
      );
    });
    expect(result.current.loading).toBe(false);
  });

  it("reset() vide le state et le cache", async () => {
    vi.mocked(postRecommendation).mockResolvedValue(results);
    const { result } = renderHook(() => useRecommendations());

    await act(async () => {
      await result.current.computeRecommendations(form);
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.recommendations).toEqual([]);
    expect(sessionStorage.getItem("reco_results")).toBeNull();
  });
});
