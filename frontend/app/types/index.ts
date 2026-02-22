export type CriterionBreakdown = {
  countryScore: number;
  similarity: number;
};

export type RecommendationResult = {
  country: {
    isoCode: string;
    name: string;
    flagUrl: string | null;
    region: string | null;
  };
  totalScore: number;
  breakdown: Record<string, CriterionBreakdown>;
};

export type TravelType = {
  value: string;
  label: string;
};

export type WizardFormData = {
  budget: string;
  climate: string[];
  activities: string[];
  continent: string;
  duration: string;
  travel_style: string;
};

export type UserStats = {
  visited: number;
  wishlist: number;
  available: number;
};
