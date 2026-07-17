import { Link } from "react-router";
import type { Visit } from "../types";

interface VisitsListProps {
  visits: Visit[];
  onRemove: (countryId: string) => void;
  removingId: string | null;
}

export function VisitsList({
  visits,
  onRemove,
  removingId,
}: Readonly<VisitsListProps>) {
  if (visits.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        Aucun pays visité pour le moment. Marquez vos voyages depuis la fiche
        d'un pays !
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {visits.map((visit) => (
        <li
          key={visit.id}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          {visit.country.flagUrl && (
            <img
              src={visit.country.flagUrl}
              alt=""
              className="w-8 h-5 object-cover rounded-sm border border-gray-100"
            />
          )}
          <div className="flex-1 min-w-0">
            <Link
              to={`/pays/${visit.country.isoCode}`}
              className="text-sm font-medium text-gray-900 hover:text-green-600"
            >
              {visit.country.name}
            </Link>
            {visit.visitedAt && (
              <p className="text-xs text-gray-500">
                Visité en{" "}
                {new Date(visit.visitedAt).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(visit.countryId)}
            disabled={removingId === visit.countryId}
            aria-label={`Retirer ${visit.country.name} de mes pays visités`}
            className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 px-2 py-1"
          >
            {removingId === visit.countryId ? "..." : "Retirer"}
          </button>
        </li>
      ))}
    </ul>
  );
}
