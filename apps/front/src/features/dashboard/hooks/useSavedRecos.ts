import { useCallback, useEffect, useState } from "react";
import {
  deleteSavedRecommendation,
  getSavedRecommendations,
} from "../services/dashboard.service";
import type { SavedReco } from "../types";

export function useSavedRecos() {
  const [recos, setRecos] = useState<SavedReco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // id de la reco en cours de suppression (désactive son bouton)
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchRecos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSavedRecommendations();
      setRecos(data);
    } catch {
      setError("Impossible de charger vos recommandations sauvegardées.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecos();
  }, [fetchRecos]);

  const removeReco = async (id: string) => {
    setRemovingId(id);
    setError(null);
    try {
      await deleteSavedRecommendation(id);
      setRecos((prev) => prev.filter((reco) => reco.id !== id));
    } catch {
      setError("Impossible de supprimer cette recommandation.");
    } finally {
      setRemovingId(null);
    }
  };

  return { recos, loading, error, removeReco, removingId, refetch: fetchRecos };
}
