import { useCountries } from "../../../shared/hooks/useCountries";
import type { Country } from "../../../shared/services/countries.service";
import { CountryCard } from "./CountryCard";

export function RecommendedCountries() {
  const { countries: countryList, loading, error } = useCountries(4);
  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur</div>;
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
          href="#"
          className="text-xs font-semibold text-green-600 hover:underline flex items-center gap-1"
        >
          Voir tout →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {countryList?.map((country: Country) => (
          <CountryCard
            key={country.isoCode}
            name={country.name}
            image={country.flagUrl ?? ""}
            description={country.description ?? ""}
          />
        ))}
      </div>
    </section>
  );
}
