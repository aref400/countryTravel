import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Sparkles, Star } from "lucide-react";
import { WizardProgress } from "./WizardProgress";
import { WizardResults } from "./WizardResults";
import { OptionButton } from "./OptionButton";
import { mapFormToBackend } from "./mapFormToBackend";
import type { RecommendationResult, WizardFormData } from "~/types";

const STEPS = [
  { id: "budget", title: "Quel est votre budget ?", icon: "💰" },
  { id: "climate", title: "Quel climat préférez-vous ?", icon: "🌤️" },
  { id: "activities", title: "Quelles activités vous attirent ?", icon: "🎯" },
  { id: "continent", title: "Quelle région du monde ?", icon: "🌍" },
  { id: "duration", title: "Durée du séjour ?", icon: "📅" },
  { id: "style", title: "Votre style de voyage ?", icon: "🎒" },
];

const OPTIONS = {
  budget: [
    { value: "low", label: "Économique (< 1 000€)" },
    { value: "medium", label: "Confort (1 000 – 3 000€)" },
    { value: "high", label: "Luxe (> 3 000€)" },
  ],
  climate: [
    { value: "tropical", label: "🌴 Tropical & chaud" },
    { value: "desert", label: "🏜️ Aride & ensoleillé" },
    { value: "temperate", label: "🌤️ Tempéré & doux" },
    { value: "cold", label: "❄️ Froid & enneigé" },
    { value: "arctic", label: "🧊 Arctique & polaire" },
  ],
  activities: [
    "culture", "nature", "city", "party", "sport",
    "aventure", "histoire", "plage", "randonnée", "surf", "gastronomie",
  ],
  continents: ["Tous", "Europe", "Asie", "Afrique", "Amérique du Nord", "Amérique du Sud", "Océanie"],
  duration: ["1 semaine", "2 semaines", "3 semaines", "1 mois et plus"],
  styles: ["Backpacker", "Famille", "Couple romantique", "Aventurier solo", "Culturel", "Farniente"],
};

const INITIAL_FORM: WizardFormData = {
  budget: "",
  climate: [],
  activities: [],
  continent: "Tous",
  duration: "",
  travel_style: "",
};

function canProceed(step: number, form: WizardFormData): boolean {
  if (step === 0) return !!form.budget;
  if (step === 1) return form.climate.length > 0;
  if (step === 2) return form.activities.length > 0;
  return true;
}

function toggleArray<K extends "climate" | "activities">(
  form: WizardFormData,
  key: K,
  value: string
): WizardFormData {
  const current = form[key];
  return {
    ...form,
    [key]: current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value],
  };
}

export function RecommendationWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardFormData>(INITIAL_FORM);
  const [results, setResults] = useState<RecommendationResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = STEPS.length;

  const handleReset = () => {
    setResults(null);
    setStep(0);
    setForm(INITIAL_FORM);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = mapFormToBackend(form);
      const res = await fetch("http://localhost:3000/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data: RecommendationResult[] = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
    else handleSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-2 border-sky-500 border-t-transparent rounded-full mb-6"
        />
        <h2 className="text-white text-xl font-bold mb-2">Analyse en cours...</h2>
        <p className="text-slate-400">On cherche vos destinations idéales ✨</p>
      </div>
    );
  }

  if (results) {
    return <WizardResults results={results} form={form} onReset={handleReset} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sky-400 text-sm mb-2">
          <Star className="w-4 h-4" /> Recommandation
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Trouvez votre destination idéale
        </h1>
        <p className="text-slate-400">
          Répondez à quelques questions et on vous trouve le voyage parfait.
        </p>
      </div>

      <WizardProgress currentStep={step} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="mb-8"
        >
          <div className="text-4xl mb-3">{STEPS[step].icon}</div>
          <h2 className="text-2xl font-bold text-white mb-6">{STEPS[step].title}</h2>

          {step === 0 && (
            <div className="grid gap-3">
              {OPTIONS.budget.map(({ value, label }) => (
                <OptionButton
                  key={value}
                  selected={form.budget === value}
                  onClick={() => setForm((f) => ({ ...f, budget: value }))}
                  showCheck
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 gap-3">
              {OPTIONS.climate.map(({ value, label }) => (
                <OptionButton
                  key={value}
                  selected={form.climate.includes(value)}
                  onClick={() => setForm((f) => toggleArray(f, "climate", value))}
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-wrap gap-2">
              {OPTIONS.activities.map((a) => (
                <OptionButton
                  key={a}
                  selected={form.activities.includes(a)}
                  onClick={() => setForm((f) => toggleArray(f, "activities", a))}
                  className="px-4 py-2 capitalize text-sm"
                >
                  {a}
                </OptionButton>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3">
              {OPTIONS.continents.map((c) => (
                <OptionButton
                  key={c}
                  selected={form.continent === c}
                  onClick={() => setForm((f) => ({ ...f, continent: c }))}
                  showCheck
                >
                  {c}
                </OptionButton>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="grid grid-cols-2 gap-3">
              {OPTIONS.duration.map((d) => (
                <OptionButton
                  key={d}
                  selected={form.duration === d}
                  onClick={() => setForm((f) => ({ ...f, duration: d }))}
                >
                  {d}
                </OptionButton>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="grid grid-cols-2 gap-3">
              {OPTIONS.styles.map((s) => (
                <OptionButton
                  key={s}
                  selected={form.travel_style === s}
                  onClick={() => setForm((f) => ({ ...f, travel_style: s }))}
                >
                  {s}
                </OptionButton>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Précédent
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed(step, form)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-all ml-auto cursor-pointer"
        >
          {step < totalSteps - 1 ? (
            <>Suivant <ArrowRight className="w-4 h-4" /></>
          ) : (
            <>Obtenir mes recommandations <Sparkles className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
