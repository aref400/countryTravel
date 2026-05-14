import { useCallback, useEffect, useState } from "react";
import { getCountries } from "../services/countries.service";
import type { Country, CountryFilters } from "../types/CountryType";

const PAGE_SIZE = 20;

export function useCountries(staticLimit?: number) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<CountryFilters>({});

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const result = await getCountries({
          ...filters,
          page,
          limit: staticLimit ?? PAGE_SIZE,
        });
        if (cancelled) return;
        setCountries((prev) =>
          page === 1 ? result.data : [...prev, ...result.data],
        );
        const fetchedSoFar =
          page === 1
            ? result.data.length
            : (page - 1) * (staticLimit ?? PAGE_SIZE) + result.data.length;
        setHasMore(fetchedSoFar < result.meta.total);
      } catch {
        if (!cancelled) setError("Impossible de charger les pays.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [page, filters, staticLimit]);

  const applyFilters = useCallback((newFilters: CountryFilters) => {
    setCountries([]);
    setFilters(newFilters);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return { countries, loading, error, hasMore, applyFilters, loadMore };
}
