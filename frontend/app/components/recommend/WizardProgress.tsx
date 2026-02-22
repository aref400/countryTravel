import { motion } from "motion/react";

type WizardProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const percent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-xs">
          Étape {currentStep + 1} sur {totalSteps}
        </span>
        <span className="text-slate-400 text-xs">{Math.round(percent)}%</span>
      </div>
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-linear-to-r from-sky-500 to-blue-500 rounded-full"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
