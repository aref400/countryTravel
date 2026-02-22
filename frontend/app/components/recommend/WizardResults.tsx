import { motion } from "motion/react";
import { Star, ArrowRight, RefreshCw, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import type { RecommendationResult, WizardFormData } from "~/types";

const BUDGET_LABELS: Record<string, string> = {
  low: "€ Économique",
  medium: "€€ Confort",
  high: "€€€ Luxe",
};

const CLIMATE_LABELS: Record<string, string> = {
  tropical: "🌴 Tropical",
  desert: "🏜️ Aride",
  temperate: "🌤️ Tempéré",
  cold: "❄️ Froid",
  arctic: "🧊 Arctique",
};

type WizardResultsProps = {
  results: RecommendationResult[];
  form: WizardFormData;
  onReset: () => void;
};

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs">
      {children}
    </span>
  );
}

function CountryResultCard({
  result,
  isBestMatch,
}: {
  result: RecommendationResult;
  isBestMatch: boolean;
}) {
  const scorePercent = Math.round(result.totalScore * 20);

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/30 transition-all">
      {isBestMatch && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-medium">
          <Star className="w-3 h-3 fill-white" /> Meilleur match
        </div>
      )}
      <div className="p-5 pt-10">
        <div className="flex items-center gap-3 mb-4">
          {result.country.flagUrl && (
            <img
              src={result.country.flagUrl}
              alt={result.country.name}
              className="w-10 h-7 object-cover rounded shadow-sm"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{result.country.name}</h3>
            <p className="text-xs text-slate-400">{result.country.region}</p>
          </div>
          <span className="text-lg font-bold text-sky-400 shrink-0">{scorePercent}%</span>
        </div>

        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-sky-500 to-blue-500 rounded-full transition-all"
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function WizardResults({ results, form, onReset }: WizardResultsProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto px-4 py-10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Vos recommandations</h1>
          <p className="text-slate-400 text-sm">Basées sur vos préférences</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 my-6">
        {form.budget && <Tag>{BUDGET_LABELS[form.budget]}</Tag>}
        {form.climate.map((c) => (
          <Tag key={c}>{CLIMATE_LABELS[c] ?? c}</Tag>
        ))}
        {form.continent !== "Tous" && <Tag>{form.continent}</Tag>}
        {form.duration && <Tag>{form.duration}</Tag>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {results.map((result, i) => (
          <CountryResultCard
            key={result.country.isoCode}
            result={result}
            isBestMatch={i === 0}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-sm transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Recommencer
        </button>
        <button
          onClick={() => navigate("/explorer")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm transition-all cursor-pointer"
        >
          Explorer plus <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
