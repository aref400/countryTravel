import { useAuthStore } from "@/shared/store/auth.store";
import { useCallback, useEffect, useState } from "react";
import {
  deleteReview,
  getCountryReviews,
  upsertReview,
} from "../services/reviews.service";
import type { CountryReview } from "../types";

export type SubmitStatus = "inactive" | "saving" | "error";

export function useCountryReviews(isoCode: string | undefined) {
  const user = useAuthStore((state) => state.user);
  const [reviews, setReviews] = useState<CountryReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("inactive");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!isoCode) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCountryReviews(isoCode);
      setReviews(data);
    } catch {
      setError("Impossible de charger les avis.");
    } finally {
      setLoading(false);
    }
  }, [isoCode]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Mon avis parmi ceux du pays (l'API garantit 1 max par user/pays)
  const myReview = reviews.find((review) => review.userId === user?.id) ?? null;

  const submitReview = async (
    countryId: string,
    rating: number,
    content: string,
  ) => {
    setSubmitStatus("saving");
    setSubmitError(null);
    try {
      const saved = await upsertReview({
        countryId,
        rating,
        content: content.trim() || undefined,
      });
      // l'avis apparaît immédiatement — remplacé s'il existait
      // (upsert), sinon ajouté en tête de liste
      setReviews((prev) =>
        prev.some((review) => review.id === saved.id)
          ? prev.map((review) => (review.id === saved.id ? saved : review))
          : [saved, ...prev],
      );
      setSubmitStatus("inactive");
      return true;
    } catch (err) {
      setSubmitStatus("error");
      setSubmitError(
        (err as { status?: number }).status === 422
          ? "Vous devez avoir visité ce pays pour donner votre avis."
          : "Impossible d'enregistrer votre avis. Veuillez réessayer.",
      );
      return false;
    }
  };

  const removeReview = async (id: string) => {
    setRemovingId(id);
    try {
      await deleteReview(id);
      setReviews((prev) => prev.filter((review) => review.id !== id));
    } catch {
      setError("Impossible de supprimer cet avis.");
    } finally {
      setRemovingId(null);
    }
  };

  return {
    reviews,
    myReview,
    loading,
    error,
    submitStatus,
    submitError,
    removingId,
    submitReview,
    removeReview,
    refetch: fetchReviews,
  };
}
