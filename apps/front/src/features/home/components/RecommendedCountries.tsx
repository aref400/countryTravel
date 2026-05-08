import { useCountries } from "../../../shared/hooks/useCountries";
import type { Country } from "../../../shared/services/countries.service";
import { CountryCard } from "./CountryCard";

export function RecommendedCountries() {
  const { countries: countryList, loading, error } = useCountries(4);

  return (
    <section className="px-4 max-w-5xl mx-auto mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Destinations Recommandées
          </h2>
          <p className="text-xs text-gray-400">
            Basé sur vos préférences d'aventure.
          </p>
        </div>
        <a
          href="/pays"
          className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-1"
        >
          Voir tout →
        </a>
      </div>

      {error ? (
        <div className="flex items-center gap-2 text-sm text-red-400 py-4">
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
          </svg>
          Impossible de charger les destinations.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
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
              ))
            : countryList?.map((country: Country) => (
                <CountryCard
                  key={country.isoCode}
                  isoCode={country.isoCode}
                  name={country.name}
                  image={country.flagUrl ?? ""}
                  description={country.description ?? ""}
                />
              ))}
        </div>
      )}
    </section>
  );
}
