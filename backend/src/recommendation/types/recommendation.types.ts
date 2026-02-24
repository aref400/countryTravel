export enum TravelType {
  Nature = 'nature',
  City = 'city',
  Culture = 'culture',
  Party = 'party',
  Sport = 'sport'
};

export interface TravelPreferences {
  budget: number;
  safety: number;
  travelTypes: TravelType[];
  travelMonth: number;
  climate: number;
  withChildren: boolean;
  region: string;
  touristPopularity: number;
}

export interface CriterionBreakdown {
  countryScore: number;
  similarity: number;
}

export interface RecommendationResult {
  country: {
    isoCode: string;
    name: string;
    flagUrl: string | null;
    region: string | null;
  };
  totalScore: number;
  breakdown: Record<string, CriterionBreakdown>;
}
