import { WorldMap } from "@/shared/components/WorldMap";
import { useMemo } from "react";
import { useNavigate } from "react-router";
import type { Visit } from "../types";

const VISITED_COLOR = "#3b82f6"; // bleu (cf. CT-021-AC-3)
const NOT_VISITED_COLOR = "#e5e7eb";

interface PersonalMapProps {
  visits: Visit[];
}

export function PersonalMap({ visits }: Readonly<PersonalMapProps>) {
  const navigate = useNavigate();

  const visitedByIsoCode = useMemo(() => {
    const map = new Map<string, Visit>();
    visits.forEach((visit) => map.set(visit.country.isoCode, visit));
    return map;
  }, [visits]);

  const getColor = (alpha2: string | undefined) =>
    alpha2 && visitedByIsoCode.has(alpha2)
      ? VISITED_COLOR
      : NOT_VISITED_COLOR;

  const getTooltipContent = (alpha2: string | undefined) => {
    const visit = alpha2 ? visitedByIsoCode.get(alpha2) : undefined;
    if (!visit) {
      return <span className="text-gray-300">Pas encore visité</span>;
    }
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{visit.country.name}</span>
        <span>✓ Visité</span>
      </div>
    );
  };

  const handleCountryClick = (alpha2: string | undefined) => {
    if (!alpha2 || !visitedByIsoCode.has(alpha2)) return;
    navigate(`/pays/${alpha2}`);
  };

  return (
    <WorldMap
      getColor={getColor}
      getTooltipContent={getTooltipContent}
      onCountryClick={handleCountryClick}
    />
  );
}
