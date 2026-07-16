import type { SavedReco } from "../types";

interface SavedRecosListProps {
  recos: SavedReco[];
  onRemove: (id: string) => void;
  removingId: string | null;
}

export function SavedRecosList({
  recos,
  onRemove,
  removingId,
}: Readonly<SavedRecosListProps>) {
  if (recos.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        Aucune recommandation sauvegardée. Lancez le moteur de recommandation
        pour trouver votre prochaine destination !
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {recos.map((reco) => {
        const name = reco.name || "Recherche sans nom";
        const topCountries = (reco.resultsSnapshot ?? [])
          .slice(0, 3)
          .map((result) => result.country.name)
          .join(", ");
        return (
          <li key={reco.id} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-900">{name}</span>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">
                  {new Date(reco.createdAt).toLocaleDateString("fr-FR")}
                </span>
                <button
                  onClick={() => onRemove(reco.id)}
                  disabled={removingId === reco.id}
                  aria-label={`Supprimer la recommandation ${name}`}
                  className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50 px-2 py-1"
                >
                  {removingId === reco.id ? "..." : "Supprimer"}
                </button>
              </div>
            </div>
            {topCountries && (
              <p className="text-xs text-gray-500 mt-1">
                Top : {topCountries}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
