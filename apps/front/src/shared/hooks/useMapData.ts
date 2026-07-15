import { useCallback, useEffect, useState } from "react";
import { getMapData } from "../services/countries.service";
import type { CountryMapData } from "../types/CountryType";

export function useMapData() {
  const [mapData, setMapData] = useState<CountryMapData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getMapData();
      setMapData(data);
    } catch {
      setError("Impossible de charger les données de la carte");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  return { mapData, loading, error, notFound, refetch: fetchMapData };
}
