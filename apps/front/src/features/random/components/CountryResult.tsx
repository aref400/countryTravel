import { Link } from "react-router";
import type { CountryDetail } from "../../../shared/types/CountryType";

export function CountryResult({
  country,
  onReplay,
}: {
  country: CountryDetail;
  onReplay: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-12 text-center animate-[fadeIn_0.5s_ease-out]">
      {country.flagUrl && (
        <img
          src={country.flagUrl}
          alt={country.name}
          className="w-24 h-16 object-cover rounded-xl shadow-sm"
        />
      )}

      <div>
        <h2 className="text-3xl font-bold text-gray-900">{country.name}</h2>
        {country.continent && (
          <p className="text-sm text-gray-400 mt-1">{country.continent}</p>
        )}
      </div>

      {country.description && (
        <p className="text-sm text-gray-500 max-w-md leading-relaxed">
          {country.description}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          to={`/pays/${country.isoCode}`}
          className="px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
        >
          Voir le pays →
        </Link>
        <button
          type="button"
          onClick={onReplay}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Rejouer 🎲
        </button>
      </div>
    </div>
  );
}
