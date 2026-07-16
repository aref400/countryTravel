import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SavedReco } from "../types";
import { useSavedRecos } from "./useSavedRecos";

vi.mock("../services/dashboard.service", () => ({
  getSavedRecommendations: vi.fn(),
  deleteSavedRecommendation: vi.fn(),
}));

import {
  deleteSavedRecommendation,
  getSavedRecommendations,
} from "../services/dashboard.service";

const makeReco = (id: string, name: string | null): SavedReco => ({
  id,
  name,
  criteriaSnapshot: {} as SavedReco["criteriaSnapshot"],
  resultsSnapshot: [],
  createdAt: "2026-07-16T00:00:00.000Z",
});

describe("useSavedRecos", () => {
  beforeEach(() => {
    vi.mocked(getSavedRecommendations).mockReset();
    vi.mocked(deleteSavedRecommendation).mockReset();
  });

  it("charge les recommandations sauvegardées au montage", async () => {
    const recos = [makeReco("reco-1", "Voyage d'été")];
    vi.mocked(getSavedRecommendations).mockResolvedValue(recos);

    const { result } = renderHook(() => useSavedRecos());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.recos).toEqual(recos);
  });

  it("removeReco retire la recommandation de la liste", async () => {
    const reco1 = makeReco("reco-1", "Voyage d'été");
    const reco2 = makeReco("reco-2", null);
    vi.mocked(getSavedRecommendations).mockResolvedValue([reco1, reco2]);
    vi.mocked(deleteSavedRecommendation).mockResolvedValue(reco1);

    const { result } = renderHook(() => useSavedRecos());
    await waitFor(() => {
      expect(result.current.recos).toHaveLength(2);
    });

    await act(async () => {
      await result.current.removeReco("reco-1");
    });

    expect(deleteSavedRecommendation).toHaveBeenCalledWith("reco-1");
    expect(result.current.recos).toEqual([reco2]);
  });

  it("garde la liste intacte et expose une erreur si la suppression échoue", async () => {
    const reco = makeReco("reco-1", "Voyage d'été");
    vi.mocked(getSavedRecommendations).mockResolvedValue([reco]);
    vi.mocked(deleteSavedRecommendation).mockRejectedValue({ status: 500 });

    const { result } = renderHook(() => useSavedRecos());
    await waitFor(() => {
      expect(result.current.recos).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeReco("reco-1");
    });

    expect(result.current.recos).toEqual([reco]);
    expect(result.current.error).toBe(
      "Impossible de supprimer cette recommandation.",
    );
  });
});
