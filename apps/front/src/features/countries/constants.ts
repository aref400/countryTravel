import type { CountryCriteria } from "./types";

export const CRITERIA_LABELS: Record<
  keyof Omit<CountryCriteria, "familyFriendly">,
  string
> = {
  budget: "Budget",
  safety: "Sécurité",
  temperature: "Température",
  tourismLevel: "Tourisme",
  natureLevel: "Nature",
  partyLevel: "Vie nocturne",
  sportLevel: "Sports",
  cultureLevel: "Culture",
  historyLevel: "Histoire",
  gastronomyLevel: "Gastronomie",
  cityLevel: "Vie urbaine",
  relaxationLevel: "Détente",
};

export const CONTINENT_LABELS: Record<string, string> = {
  europe: "Europe",
  asia: "Asie",
  africa: "Afrique",
  americas: "Amériques",
  north_america: "Amérique du Nord",
  south_america: "Amérique du Sud",
  oceania: "Océanie",
  poles: "Antarctique",
};
