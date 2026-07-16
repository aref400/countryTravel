import { useCallback, useEffect, useState } from "react";
import { getMyReviews } from "../services/dashboard.service";
import type { MyReview } from "../types";

export function useMyReviews() {
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyReviews();
      setReviews(data);
    } catch {
      setError("Impossible de charger vos avis.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}
