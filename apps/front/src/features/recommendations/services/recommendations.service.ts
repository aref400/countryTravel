import { apiClient } from "@/shared/lib/fetch.instance";
import type {
  RecoFormDto,
  RecommendationResponse,
  SaveRecommendation,
} from "../types";

export const postRecommendation = (form: RecoFormDto) => {
  return apiClient.post<RecommendationResponse[]>(
    "/v1/recommendations/compute",
    form,
  );
};

export const saveRecommendation = (recommendation: SaveRecommendation) => {
  return apiClient.post("/v1/recommendations/save", recommendation);
};
