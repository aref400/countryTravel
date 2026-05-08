import { CriteriaBar } from "@/features/countries/components/CriteriaBar";
import {
  CONTINENT_LABELS,
  CRITERIA_LABELS,
} from "@/shared/constants/countries.constants";
import { useCountry } from "@/shared/hooks/useCountry";
import { useNavigate, useParams } from "react-router";

export function CountryDetail() {
  const { isoCode } = useParams<{ isoCode: string }>();
  const { country, loading, error, notFound } = useCountry(isoCode ?? "");
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center gap-4 text-center">
        <span className="text-6xl">🌍</span>
        <h1 className="text-2xl font-bold text-gray-900">Pays introuvable</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Le pays que vous recherchez n'existe pas ou n'est pas encore
          disponible.
        </p>
        <a
          href="/"
          className="mt-2 text-sm font-semibold text-green-600 hover:underline"
        >
          ← Retour à l'accueil
        </a>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-red-500 text-sm">
        {error ?? "Une erreur est survenue."}
      </div>
    );
  }

  const criteria = country.criteria;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Retour
      </button>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
        <div className="relative h-48 sm:h-64 bg-linear-to-br from-green-100 to-green-50 flex items-center justify-center">
          {country.flagUrl ? (
            <img
              src={country.flagUrl}
              alt={`Drapeau ${country.name}`}
              className="h-28 sm:h-40 object-contain drop-shadow-md"
            />
          ) : (
            <span className="text-8xl">🌍</span>
          )}
        </div>

        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{country.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
              {country.capital && (
                <span className="flex items-center gap-1">
                  Capital : {country.capital}
                </span>
              )}
              {country.continent && (
                <span className="flex items-center gap-1">
                  Continent :{" "}
                  {CONTINENT_LABELS[country.continent] ?? country.continent}
                </span>
              )}
              <span className="flex items-center gap-1 font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                {country.isoCode}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {country.avgRating !== null ? (
              <div className="flex flex-col items-center bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2">
                <span className="text-2xl font-bold text-yellow-500">
                  ★ {country.avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  {country.nbReviews} avis
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <span className="text-sm text-gray-400">Pas encore noté</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {country.description && (
          <div className="bg-white rounded-2xl shadow-sm p-6 md:col-span-2">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              À propos
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {country.description}
            </p>
          </div>
        )}
        {criteria && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Caractéristiques
            </h2>
            <div className="flex flex-col gap-3">
              {(
                ["budget", "safety", "temperature", "tourismLevel"] as const
              ).map((key) => (
                <CriteriaBar
                  key={key}
                  label={CRITERIA_LABELS[key]}
                  value={criteria[key] as number}
                />
              ))}
              <div className="pt-2 flex items-center gap-2">
                <span className="text-xs text-gray-600">Famille</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    criteria.familyFriendly
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {criteria.familyFriendly
                    ? "Adapté famille"
                    : "Non recommandé famille"}
                </span>
              </div>
            </div>
          </div>
        )}

        {criteria && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              Types d'expériences
            </h2>
            <div className="flex flex-col gap-3">
              {(
                [
                  "natureLevel",
                  "cultureLevel",
                  "historyLevel",
                  "gastronomyLevel",
                  "cityLevel",
                  "relaxationLevel",
                  "sportLevel",
                  "partyLevel",
                ] as const
              ).map((key) => (
                <CriteriaBar
                  key={key}
                  label={CRITERIA_LABELS[key]}
                  value={criteria[key] as number}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
          Avis voyageurs
        </h2>
        {country.nbReviews === 0 ? (
          <p className="text-gray-400 text-sm">
            Aucun avis pour ce pays pour l'instant.
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            {country.nbReviews} avis · fonctionnalité bientôt disponible.
          </p>
        )}
      </div>
    </div>
  );
}
