export type FormChangeHandler = (
  key: keyof RecoFormDto,
  value: number | boolean,
) => void;

export interface RecoFormDto {
  budget: number;
  safety: number;
  temperature: number;
  familyFriendly: boolean;
  natureLevel: number;
  partyLevel: number;
  sportLevel: number;
  cultureLevel: number;
  historyLevel: number;
  gastronomyLevel: number;
  cityLevel: number;
  relaxationLevel: number;
}

export interface RecommendationResponse {
  rank: number;
  score: number;
  country: {
    isoCode: string;
    name: string;
    flagUrl: string | null;
    continent: string | null;
    description: string | null;
  };
}

export interface SaveRecommendation {
  name?: string;
  criteriaSnapshot: RecoFormDto;
  resultsSnapshot: RecommendationResponse[];
}
