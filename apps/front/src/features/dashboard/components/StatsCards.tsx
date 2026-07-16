interface StatsCardsProps {
  nbVisits: number;
  nbReviews: number;
  nbSavedRecos: number;
}

const STATS = [
  { key: "visits", label: "Pays visités" },
  { key: "avis", label: "Avis publiés" },
  { key: "recommandations", label: "Recommandations sauvegardées" },
] as const;

export function StatsCards({
  nbVisits,
  nbReviews,
  nbSavedRecos,
}: Readonly<StatsCardsProps>) {
  const values: Record<(typeof STATS)[number]["key"], number> = {
    visits: nbVisits,
    avis: nbReviews,
    recommandations: nbSavedRecos,
  };

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-4"
        >
          <div>
            <dd className="text-2xl font-bold text-gray-900">
              {values[stat.key]}
            </dd>
            <dt className="text-sm text-gray-500">{stat.label}</dt>
          </div>
        </div>
      ))}
    </dl>
  );
}
