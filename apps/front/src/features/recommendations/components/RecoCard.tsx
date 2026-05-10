import { Link } from "react-router";
import type { RecommendationResponse } from "../types";

interface Props {
  reco: RecommendationResponse;
}

export function RecoCard({ reco }: Props) {
  return (
    <Link
      to={`/pays/${reco.country.isoCode}`}
      className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50 text-green-700 font-bold text-sm shrink-0">
        #{reco.rank}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm group-hover:text-green-600 transition-colors">
          {reco.country.name}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {reco.country.continent ?? ""}
          {reco.country.description
            ? ` · ${reco.country.description.slice(0, 60)}…`
            : ""}
        </p>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span className="text-lg font-bold text-green-600">{reco.score}%</span>
        <span className="text-[10px] text-gray-300 font-medium">score</span>
      </div>

      {reco.country.flagUrl && (
        <img
          src={reco.country.flagUrl}
          alt={reco.country.name}
          className="w-8 h-6 object-cover rounded shrink-0"
        />
      )}
    </Link>
  );
}
