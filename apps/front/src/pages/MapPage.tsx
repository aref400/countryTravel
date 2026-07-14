import { MapLegend } from "@/features/countriesMap/components/MapLegend";
import { getColorForRating, MAP_COLORS } from "@/features/countriesMap/utils/colorScale";
import { WorldMap } from "@/shared/components/WorldMap";
import { useMapData } from "@/shared/hooks/useMapData";
import type { CountryMapData } from "@/shared/types/CountryType";
import { useMemo } from "react";
import { useNavigate } from "react-router";

export function MapPage() {
  const { mapData, loading, error } = useMapData();
  const navigate = useNavigate();

  const countryByIsoCode = useMemo(() => {
    const map = new Map<string, CountryMapData>();
    (mapData ?? []).forEach((country) => map.set(country.isoCode, country));
    return map;
  }, [mapData]);

  const getColor = (alpha2: string | undefined) => {
    const country = alpha2 ? countryByIsoCode.get(alpha2) : undefined;
    if (!country) return MAP_COLORS.unavailable;
    return getColorForRating(country.avgRating);
  };

  const getTooltipContent = (alpha2: string | undefined) => {
    const country = alpha2 ? countryByIsoCode.get(alpha2) : undefined;
    if (!country) {
      return <span className="text-gray-300">Pas encore disponible</span>;
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{country.name}</span>
        <span>
          {country.avgRating !== null
            ? `★ ${country.avgRating.toFixed(1)} (${country.nbReviews} avis)`
            : "Pas encore d'avis"}
        </span>
      </div>
    );
  };

  const handleCountryClick = (alpha2: string | undefined) => {
    if (!alpha2 || !countryByIsoCode.has(alpha2)) return;
    navigate(`/pays/${alpha2}`);
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 pt-10 pb-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-green-600 uppercase mb-3">
          Carte du monde
        </span>
        <h1 className="text-2xl font-bold text-gray-900">
          Explorez les pays par note
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Survolez un pays pour voir sa note, cliquez pour découvrir sa fiche.
        </p>
      </div>

      <div className="relative w-full px-4 pb-10">
        {error ? (
          <div className="text-center py-16 text-red-400 text-sm">{error}</div>
        ) : loading ? (
          <div className="text-center py-16 text-gray-400 text-sm animate-pulse">
            Chargement de la carte...
          </div>
        ) : (
          <>
            <WorldMap
              getColor={getColor}
              getTooltipContent={getTooltipContent}
              onCountryClick={handleCountryClick}
            />
            <MapLegend />
          </>
        )}
      </div>
    </div>
  );
}
