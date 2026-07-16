import { useCallback, useEffect, useState } from "react";
import { deleteVisit, getMyVisits } from "../services/dashboard.service";
import type { Visit } from "../types";

export function useMyVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // countryId de la visite en cours de suppression (désactive son bouton)
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchVisits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyVisits();
      setVisits(data);
    } catch {
      setError("Impossible de charger vos pays visités.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const removeVisit = async (countryId: string) => {
    setRemovingId(countryId);
    setError(null);
    try {
      await deleteVisit(countryId);
      // La liste ET la carte lisent ce state : les deux se mettent à jour
      setVisits((prev) => prev.filter((v) => v.countryId !== countryId));
    } catch {
      setError("Impossible de supprimer cette visite.");
    } finally {
      setRemovingId(null);
    }
  };

  return { visits, loading, error, removeVisit, removingId, refetch: fetchVisits };
}
