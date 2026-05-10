import { useEffect, useState } from "react";
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
      sessionStorage.setItem("reco_results", JSON.stringify(data));
      setRecommendations(data);
    } catch {
      setError("Impossible de charger les recommandations.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setRecommendations([]);
    sessionStorage.removeItem("reco_results");
    setError(null);
  };
  useEffect(() => {
    const cached = sessionStorage.getItem("reco_results");
    if (cached) setRecommendations(JSON.parse(cached));
  }, []);

  return {
    recommendations,
    loading,
    error,
    computeRecommendations,
    reset,
  };
}
