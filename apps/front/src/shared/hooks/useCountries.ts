import { useEffect, useState } from "react";
import { getCountries, type Country } from "../services/countries.service";

export function useCountries(limit?: number) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCountries() {
      setLoading(true);
      try {
        const data = await getCountries(limit);
        setCountries(data.data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch countries",
        );
      }
      setLoading(false);
    }
    fetchCountries();
  }, [limit]);

  return { countries, loading, error };
}
