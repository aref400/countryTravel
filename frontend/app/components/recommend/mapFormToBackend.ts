import type { WizardFormData } from "~/types";

const BUDGET_MAP: Record<string, number> = {
  low: 1,
  medium: 3,
  high: 5,
};

const CLIMATE_SCORE: Record<string, number> = {
  tropical: 5,
  desert: 5,
  temperate: 3,
  cold: 1,
  arctic: 1,
};

const VALID_TRAVEL_TYPES = ["nature", "city", "culture", "party", "sport"] as const;
type ValidTravelType = (typeof VALID_TRAVEL_TYPES)[number];

function toClimateScore(climates: string[]): number {
  if (climates.length === 0) return 3;
  const avg = climates.reduce((sum, c) => sum + (CLIMATE_SCORE[c] ?? 3), 0) / climates.length;
  return Math.round(avg);
}

function toTravelTypes(activities: string[]): ValidTravelType[] {
  return activities.filter((a): a is ValidTravelType =>
    VALID_TRAVEL_TYPES.includes(a as ValidTravelType)
  );
}

export type BackendPayload = {
  budget: number;
  safety: number;
  climate: number;
  touristPopularity: number;
  travelMonth: number;
  withChildren: boolean;
  travelTypes: ValidTravelType[];
};

export function mapFormToBackend(form: WizardFormData): BackendPayload {
  return {
    budget: BUDGET_MAP[form.budget] ?? 3,
    safety: 3,
    climate: toClimateScore(form.climate),
    touristPopularity: 3,
    travelMonth: new Date().getMonth() + 1,
    withChildren: form.travel_style === "Famille",
    travelTypes: toTravelTypes(form.activities),
  };
}
