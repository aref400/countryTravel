import type { FormChangeHandler, RecoFormDto } from "../../types";
import { CriteriaSelector } from "../CriteriaSelector";

interface Props {
  values: RecoFormDto;
  onChange: FormChangeHandler;
}

export function Step1Practical({ values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <CriteriaSelector
        label="Budget"
        description="Quel budget avez-vous pour ce voyage ?"
        value={values.budget}
        onChange={(v) => onChange("budget", v)}
      />
      <CriteriaSelector
        label="Sécurité"
        description="Quel niveau de sécurité est indispensable ?"
        value={values.safety}
        onChange={(v) => onChange("safety", v)}
      />
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
        <div>
          <p className="font-semibold text-gray-800 text-sm">
            Voyage en famille
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Filtrer les destinations adaptées aux enfants
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange("familyFriendly", !values.familyFriendly)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
            values.familyFriendly ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
              values.familyFriendly ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
