import type { FormChangeHandler, RecoFormDto } from "../../types";
import { CriteriaSelector } from "../CriteriaSelector";

interface Props {
  values: RecoFormDto;
  onChange: FormChangeHandler;
}

export function Step4Culture({ values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <CriteriaSelector
        label="Culture & Arts"
        description="Musées, architecture, art contemporain"
        value={values.cultureLevel}
        onChange={(v) => onChange("cultureLevel", v)}
      />
      <CriteriaSelector
        label="Histoire"
        description="Sites antiques, patrimoine, ruines"
        value={values.historyLevel}
        onChange={(v) => onChange("historyLevel", v)}
      />
      <CriteriaSelector
        label="Gastronomie"
        description="Cuisine locale, marchés, restaurants"
        value={values.gastronomyLevel}
        onChange={(v) => onChange("gastronomyLevel", v)}
      />
    </div>
  );
}
