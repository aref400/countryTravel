import type {
  RecoFormDto,
  RecommendationResponse,
} from "@/features/recommendations/types";
import type { Country } from "@/shared/types/CountryType";

export interface Visit {
  id: string;
  countryId: string;
  visitedAt: string | null;
  createdAt: string;
  country: Pick<Country, "id" | "isoCode" | "name" | "flagUrl" | "continent">;
}

export interface MyReview {
  id: string;
  rating: number;
  content: string | null;
  createdAt: string;
  updatedAt: string;
  country: Pick<Country, "id" | "isoCode" | "name" | "flagUrl">;
}

export interface SavedReco {
  id: string;
  name: string | null;
  criteriaSnapshot: RecoFormDto;
  resultsSnapshot: RecommendationResponse[];
  createdAt: string;
}
