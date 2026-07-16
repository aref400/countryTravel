import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Visit } from "../types";
import { useMyVisits } from "./useMyVisits";

vi.mock("../services/dashboard.service", () => ({
  getMyVisits: vi.fn(),
  deleteVisit: vi.fn(),
}));

import { deleteVisit, getMyVisits } from "../services/dashboard.service";

const makeVisit = (countryId: string, isoCode: string, name: string): Visit => ({
  id: `visit-${countryId}`,
  countryId,
  visitedAt: null,
  createdAt: "2026-07-16T00:00:00.000Z",
  country: {
    id: countryId,
    isoCode,
    name,
    flagUrl: null,
    continent: "europe",
  },
});

describe("useMyVisits", () => {
  beforeEach(() => {
    vi.mocked(getMyVisits).mockReset();
    vi.mocked(deleteVisit).mockReset();
  });

  it("charge les visites au montage", async () => {
    const visits = [makeVisit("c1", "FR", "France")];
    vi.mocked(getMyVisits).mockResolvedValue(visits);

    const { result } = renderHook(() => useMyVisits());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.visits).toEqual(visits);
  });

  it("expose une erreur lisible si le chargement échoue", async () => {
    vi.mocked(getMyVisits).mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useMyVisits());

    await waitFor(() => {
      expect(result.current.error).toBe(
        "Impossible de charger vos pays visités.",
      );
    });
    expect(result.current.visits).toEqual([]);
  });

  it("removeVisit retire la visite du state partagé (liste + carte, CT-021-AC-4)", async () => {
    const fr = makeVisit("c1", "FR", "France");
    const jp = makeVisit("c2", "JP", "Japon");
    vi.mocked(getMyVisits).mockResolvedValue([fr, jp]);
    vi.mocked(deleteVisit).mockResolvedValue(fr);

    const { result } = renderHook(() => useMyVisits());
    await waitFor(() => {
      expect(result.current.visits).toHaveLength(2);
    });

    await act(async () => {
      await result.current.removeVisit("c1");
    });

    expect(deleteVisit).toHaveBeenCalledWith("c1");
    expect(result.current.visits).toEqual([jp]);
  });

  it("garde la liste intacte et expose une erreur si la suppression échoue", async () => {
    const fr = makeVisit("c1", "FR", "France");
    vi.mocked(getMyVisits).mockResolvedValue([fr]);
    vi.mocked(deleteVisit).mockRejectedValue({ status: 500 });

    const { result } = renderHook(() => useMyVisits());
    await waitFor(() => {
      expect(result.current.visits).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeVisit("c1");
    });

    expect(result.current.visits).toEqual([fr]);
    expect(result.current.error).toBe("Impossible de supprimer cette visite.");
  });
});
