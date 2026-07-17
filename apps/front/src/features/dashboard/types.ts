import type {
  RecoFormDto,
  RecommendationResponse,
} from "@/features/recommendations/types";
import type { Country } from "@/shared/types/CountryType";

// Le type Visit vit dans la feature visits (partagé avec la fiche pays)
export type { Visit } from "@/features/visits/types";

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
