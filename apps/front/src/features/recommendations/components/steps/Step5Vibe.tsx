import type { FormChangeHandler, RecoFormDto } from "../../types";
import { CriteriaSelector } from "../CriteriaSelector";

interface Props {
  values: RecoFormDto;
  onChange: FormChangeHandler;
}

export function Step5Vibe({ values, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <CriteriaSelector
        label="Vie nocturne"
        description="Bars, clubs, fêtes locales"
        value={values.partyLevel}
        onChange={(v) => onChange("partyLevel", v)}
      />
      <CriteriaSelector
        label="Vie urbaine"
        description="Grandes villes, shopping, transports"
        value={values.cityLevel}
        onChange={(v) => onChange("cityLevel", v)}
      />
    </div>
  );
}
