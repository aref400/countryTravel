import type { UserStats } from "~/types";

type StatsBarProps = {
  stats: UserStats;
};

const STAT_LABELS: Record<keyof UserStats, string> = {
  visited: "pays visités",
  wishlist: "dans la wishlist",
  available: "pays disponibles",
};

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex items-center gap-8 mt-8">
      {(Object.keys(stats) as Array<keyof UserStats>).map((key) => (
        <div key={key}>
          <p className="text-2xl font-bold text-white">{stats[key]}</p>
          <p className="text-xs text-gray-500 mt-0.5">{STAT_LABELS[key]}</p>
        </div>
      ))}
    </div>
  );
}
