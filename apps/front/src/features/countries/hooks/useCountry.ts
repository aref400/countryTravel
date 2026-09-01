import { useEffect, useState } from "react";
import { getCountryByIsoCode } from "../services/countries.service";
import type { CountryDetail } from "../types";

export function useCountry(isoCode: string) {
  const [country, setCountry] = useState<CountryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchCountry() {
      setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        const data = await getCountryByIsoCode(isoCode);
        setCountry(data);
      } catch (err: unknown) {
        const e = err as { status?: number };
        if (e?.status === 404) {
          setNotFound(true);
        } else {
          setError("Impossible de charger ce pays.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCountry();
  }, [isoCode]);

  return { country, loading, error, notFound };
}
