import type { RecoFormDto } from "./types";

export const STEPS = [
  { title: "Contraintes pratiques", subtitle: "Budget, sécurité, famille" },
  { title: "Climat idéal", subtitle: "Quelle température vous correspond ?" },
  { title: "Plein air & détente", subtitle: "Nature, sport, relaxation" },
  { title: "Culture & saveurs", subtitle: "Histoire, arts, gastronomie" },
  { title: "Ambiance", subtitle: "Vie nocturne et urbaine" },
];

export const DEFAULT_FORM: RecoFormDto = {
  budget: 3,
  safety: 3,
  temperature: 3,
  familyFriendly: false,
  natureLevel: 3,
  partyLevel: 3,
  sportLevel: 3,
  cultureLevel: 3,
  historyLevel: 3,
  gastronomyLevel: 3,
  cityLevel: 3,
  relaxationLevel: 3,
};
