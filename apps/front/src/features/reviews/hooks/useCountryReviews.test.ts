import { useAuthStore } from "@/shared/store/auth.store";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CountryReview } from "../types";
import { useCountryReviews } from "./useCountryReviews";

vi.mock("../services/reviews.service", () => ({
  getCountryReviews: vi.fn(),
  upsertReview: vi.fn(),
  deleteReview: vi.fn(),
}));

import {
  deleteReview,
  getCountryReviews,
  upsertReview,
} from "../services/reviews.service";

const makeReview = (
  id: string,
  userId: string,
  rating: number,
): CountryReview => ({
  id,
  userId,
  countryId: "country-1",
  rating,
  content: null,
  isVisible: true,
  createdAt: "2026-07-16T00:00:00.000Z",
  updatedAt: "2026-07-16T00:00:00.000Z",
  user: { username: `user-${userId}`, avatarUrl: null },
});

describe("useCountryReviews", () => {
  beforeEach(() => {
    vi.mocked(getCountryReviews).mockReset();
    vi.mocked(upsertReview).mockReset();
    vi.mocked(deleteReview).mockReset();
    useAuthStore.setState({
      user: { id: "me", email: "me@t.fr", username: "moi", role: "user" },
      accessToken: "token",
      refreshToken: "refresh",
    });
  });

  it("charge les avis du pays et identifie le mien", async () => {
    const mine = makeReview("r1", "me", 5);
    const other = makeReview("r2", "someone", 3);
    vi.mocked(getCountryReviews).mockResolvedValue([mine, other]);

    const { result } = renderHook(() => useCountryReviews("FR"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.myReview).toEqual(mine);
  });

  it("submitReview ajoute un nouvel avis en tête de liste (CT-022-AC-3)", async () => {
    vi.mocked(getCountryReviews).mockResolvedValue([
      makeReview("r2", "someone", 3),
    ]);
    const saved = makeReview("r-new", "me", 4);
    vi.mocked(upsertReview).mockResolvedValue(saved);

    const { result } = renderHook(() => useCountryReviews("FR"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitReview("country-1", 4, "Top !");
    });

    expect(result.current.reviews[0]).toEqual(saved);
    expect(result.current.reviews).toHaveLength(2);
    expect(result.current.myReview).toEqual(saved);
  });

  it("submitReview remplace mon avis existant sans doublon (upsert)", async () => {
    const mine = makeReview("r1", "me", 2);
    vi.mocked(getCountryReviews).mockResolvedValue([mine]);
    const updated = { ...mine, rating: 5 };
    vi.mocked(upsertReview).mockResolvedValue(updated);

    const { result } = renderHook(() => useCountryReviews("FR"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.submitReview("country-1", 5, "");
    });

    expect(result.current.reviews).toHaveLength(1);
    expect(result.current.reviews[0].rating).toBe(5);
  });

  it("expose le message métier sur un 422 (pays non visité)", async () => {
    vi.mocked(getCountryReviews).mockResolvedValue([]);
    vi.mocked(upsertReview).mockRejectedValue({ status: 422 });

    const { result } = renderHook(() => useCountryReviews("FR"));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let ok = true;
    await act(async () => {
      ok = await result.current.submitReview("country-1", 4, "");
    });

    expect(ok).toBe(false);
    expect(result.current.submitError).toBe(
      "Vous devez avoir visité ce pays pour donner votre avis.",
    );
  });

  it("removeReview retire l'avis de la liste", async () => {
    const mine = makeReview("r1", "me", 4);
    vi.mocked(getCountryReviews).mockResolvedValue([mine]);
    vi.mocked(deleteReview).mockResolvedValue(mine);

    const { result } = renderHook(() => useCountryReviews("FR"));
    await waitFor(() => {
      expect(result.current.reviews).toHaveLength(1);
    });

    await act(async () => {
      await result.current.removeReview("r1");
    });

    expect(result.current.reviews).toHaveLength(0);
    expect(result.current.myReview).toBeNull();
  });
});
