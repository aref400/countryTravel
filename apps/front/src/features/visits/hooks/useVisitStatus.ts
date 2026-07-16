import { useAuthStore } from "@/shared/store/auth.store";
import { useEffect, useState } from "react";
import { addVisit, getMyVisits } from "../services/visits.service";

/**
 * Indique si l'utilisateur connecté a visité le pays donné,
 * et permet de le marquer comme visité.
 */
export function useVisitStatus(countryId: string | undefined) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const [visited, setVisited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Visiteur anonyme ou pays pas encore chargé : rien à vérifier
    if (!countryId || !isAuthenticated) {
      setVisited(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getMyVisits()
      .then((visits) => {
        if (cancelled) return;
        setVisited(visits.some((visit) => visit.countryId === countryId));
      })
      .catch(() => {
        if (cancelled) return;
        setError("Impossible de vérifier vos pays visités.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryId, isAuthenticated]);

  const markVisited = async () => {
    if (!countryId) return;
    setAdding(true);
    setError(null);
    try {
      await addVisit(countryId);
      setVisited(true);
    } catch (err) {
      // 409 : le pays était déjà marqué visité — l'état final est le même
      if ((err as { status?: number }).status === 409) {
        setVisited(true);
      } else {
        setError("Impossible d'ajouter ce pays à vos visites.");
      }
    } finally {
      setAdding(false);
    }
  };

  return { visited, loading, adding, error, markVisited };
}
