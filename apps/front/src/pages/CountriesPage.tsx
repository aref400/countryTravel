import { CountryCard } from "@/features/countries/components/CountryCard";
import { CountryFilters } from "@/features/countries/components/CountryFilters";
import { useCountries } from "@/shared/hooks/useCountries";
import type { CountryFilters as CountryFiltersType } from "@/shared/types/CountryType";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export function CountriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";

  const { countries, loading, error, hasMore, applyFilters, loadMore } =
    useCountries();

  const initialFilters = useMemo(
    () => (initialSearch ? { search: initialSearch } : {}),
    [initialSearch],
  );

  const handleFiltersChange = useCallback(
    (filters: CountryFiltersType) => {
      applyFilters(filters);
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      setSearchParams(params, { replace: true });
    },
    [applyFilters, setSearchParams],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Explorer les pays</h1>
        <p className="text-sm text-gray-500 mt-1">
          Découvrez et filtrez parmi les destinations disponibles.
        </p>
      </div>

      <CountryFilters
        key={initialSearch}
        onFiltersChange={handleFiltersChange}
        initialFilters={initialFilters}
      />

      {error ? (
        <div className="text-center py-16 text-red-400 text-sm">{error}</div>
      ) : (
        <>
          {!loading && countries.length === 0 && (
            <div className="text-center py-16 flex flex-col items-center gap-3">
              <span className="text-5xl">🔍</span>
              <p className="text-gray-500 text-sm">
                Aucun pays ne correspond à vos critères.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {countries.map((country) => (
              <CountryCard
                key={country.isoCode}
                isoCode={country.isoCode}
                name={country.name}
                image={country.flagUrl ?? ""}
                description={country.description ?? ""}
              />
            ))}
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-40 bg-gray-100" />
                  <div className="p-3 flex flex-col gap-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
          </div>
          {hasMore && !loading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                Charger plus
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
