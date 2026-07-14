import type { CountryFilters } from "@/shared/types/CountryType";
import { useEffect, useState } from "react";

const CONTINENTS = [
  { value: "", label: "Tous les continents" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asie" },
  { value: "africa", label: "Afrique" },
  { value: "americas", label: "Amériques" },
  { value: "oceania", label: "Océanie" },
];

const CURRENCIES = [
  { value: "", label: "Toutes les monnaies" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "USD", label: "Dollar US (USD)" },
  { value: "GBP", label: "Livre sterling (GBP)" },
  { value: "JPY", label: "Yen japonais (JPY)" },
  { value: "CAD", label: "Dollar canadien (CAD)" },
  { value: "AUD", label: "Dollar australien (AUD)" },
  { value: "CHF", label: "Franc suisse (CHF)" },
  { value: "CNY", label: "Yuan chinois (CNY)" },
  { value: "BRL", label: "Real brésilien (BRL)" },
  { value: "MXN", label: "Peso mexicain (MXN)" },
];

interface CountryFiltersProps {
  onFiltersChange: (filters: CountryFilters) => void;
  initialFilters?: CountryFilters;
}

export function CountryFilters({
  onFiltersChange,
  initialFilters = {},
}: CountryFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search ?? "");
  const [continent, setContinent] = useState(initialFilters.continent ?? "");
  const [currency, setCurrency] = useState(initialFilters.currency ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange({
        search: search || undefined,
        continent: continent || undefined,
        currency: currency || undefined,
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, continent, currency, onFiltersChange]);

  function handleReset() {
    setSearch("");
    setContinent("");
    setCurrency("");
  }

  const hasActiveFilters = search || continent || currency;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-col gap-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un pays..."
          aria-label="Rechercher un pays"
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={continent}
          onChange={(e) => setContinent(e.target.value)}
          aria-label="Filtrer par continent"
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 text-gray-700"
        >
          {CONTINENTS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          aria-label="Filtrer par monnaie"
          className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-300 text-gray-700"
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 whitespace-nowrap"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
