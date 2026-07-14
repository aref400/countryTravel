import { useAuthStore } from "@/shared/store/auth.store";
import { useState } from "react";
import { Link } from "react-router";
import { RecoCard } from "../features/recommendations/components/RecoCard";
import { SaveRecoModal } from "../features/recommendations/components/SaveRecoModal";
import {
  Step1Practical,
  Step2Climate,
  Step3Outdoor,
  Step4Culture,
  Step5Vibe,
} from "../features/recommendations/components/steps";
import { DEFAULT_FORM, STEPS } from "../features/recommendations/constants";
import { useRecommendations } from "../features/recommendations/hooks/useRecommendations";
import { saveRecommendation } from "../features/recommendations/services/recommendations.service";
import type { RecoFormDto } from "../features/recommendations/types";

export function RecommendationPage() {
  const { user } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RecoFormDto>(DEFAULT_FORM);
  const { recommendations, loading, error, computeRecommendations, reset } =
    useRecommendations();

  const submitted = recommendations.length > 0 || error !== null;

  const handleChange = (key: keyof RecoFormDto, value: number | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < 5) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    await computeRecommendations(formData);
  };

  const handleSave = async (name?: string) => {
    try {
      await saveRecommendation({
        name: name || "Test",
        criteriaSnapshot: formData,
        resultsSnapshot: recommendations,
      });
      setIsModalOpen(false);
    } catch {
      setSaveError("Erreur lors de la sauvegarde");
    }
  };

  const handleReset = () => {
    setStep(1);
    setFormData(DEFAULT_FORM);
    reset();
  };

  const progress = (step / 5) * 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-green-600 uppercase mb-3">
          Recommandations
        </span>
        <h1 className="text-2xl font-bold text-gray-900">
          Trouvez votre destination idéale
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Répondez à 5 questions pour obtenir vos top 5 destinations
          personnalisées.
        </p>
      </div>

      {!submitted ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="px-4 sm:px-8 py-6">
            {/* Step header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">
                  Étape {step} sur 5
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  {STEPS[step - 1].title}
                </h2>
                <p className="text-sm text-gray-400">
                  {STEPS[step - 1].subtitle}
                </p>
              </div>
              <div className="hidden sm:flex gap-1">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 <= step ? "bg-green-500 w-6" : "bg-gray-100 w-3"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="min-h-65">
              {step === 1 && (
                <Step1Practical values={formData} onChange={handleChange} />
              )}
              {step === 2 && (
                <Step2Climate values={formData} onChange={handleChange} />
              )}
              {step === 3 && (
                <Step3Outdoor values={formData} onChange={handleChange} />
              )}
              {step === 4 && (
                <Step4Culture values={formData} onChange={handleChange} />
              )}
              {step === 5 && (
                <Step5Vibe values={formData} onChange={handleChange} />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBack}
                disabled={step === 1}
                className="px-5 py-2.5 text-sm font-semibold text-gray-500 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Retour
              </button>
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  Suivant →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60"
                >
                  {loading ? "Calcul en cours…" : "Voir mes destinations ✦"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Results */
        <div className="flex flex-col gap-4">
          {error && (
            <div role="alert" className="text-center py-8 text-red-400 text-sm">
              {error}
            </div>
          )}

          {recommendations.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900">
                  Vos top {recommendations.length} destinations
                </h2>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
                >
                  Recommencer
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {recommendations.map((reco) => (
                  <RecoCard key={reco.country.isoCode} reco={reco} />
                ))}
              </div>

              {user && (
                <>
                  <button
                    type="button"
                    className="mt-4 w-full py-3 bg-green-500 text-white text-sm font-semibold rounded-2xl hover:bg-green-600 transition-colors"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Sauvegarder ces recommandations
                  </button>
                  <SaveRecoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    error={saveError}
                  />
                </>
              )}

              {!user && (
                <p className="text-center text-xs text-gray-400 mt-2">
                  <Link
                    to="/auth/login"
                    className="text-green-600 underline underline-offset-2"
                  >
                    Connectez-vous
                  </Link>{" "}
                  pour sauvegarder vos résultats.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
