import { useState } from "react";
import { postRecommendation } from "../services/recommendations.service";
import type { RecoFormDto, RecommendationResponse } from "../types";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<
    RecommendationResponse[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const computeRecommendations = async (form: RecoFormDto) => {
    setLoading(true);
    setError(null);
    try {
      const data = await postRecommendation(form);
      setRecommendations(data);
    } catch {
      setError("Impossible de charger les recommandations.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRecommendations([]);
    setError(null);
  };

  return {
    recommendations,
    loading,
    error,
    computeRecommendations,
    reset,
  };
}
