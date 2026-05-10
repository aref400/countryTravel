import type { FormChangeHandler, RecoFormDto } from "../../types";
import { CriteriaSelector } from "../CriteriaSelector";

interface Props {
  values: RecoFormDto;
  onChange: FormChangeHandler;
}

export function Step3Outdoor({ values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <CriteriaSelector
        label="Nature"
        description="Forêts, montagnes, paysages sauvages"
        value={values.natureLevel}
        onChange={(v) => onChange("natureLevel", v)}
      />
      <CriteriaSelector
        label="Sport & Aventure"
        description="Randonnée, surf, sports extrêmes"
        value={values.sportLevel}
        onChange={(v) => onChange("sportLevel", v)}
      />
      <CriteriaSelector
        label="Détente"
        description="Plages, spas, rythme lent"
        value={values.relaxationLevel}
        onChange={(v) => onChange("relaxationLevel", v)}
      />
    </div>
  );
}
