import { apiClient } from "@/shared/lib/fetch.instance";
import type { RecoFormDto, RecommendationResponse } from "../types";

export const postRecommendation = (form: RecoFormDto) => {
  return apiClient.post<RecommendationResponse[]>(
    "/v1/recommendations/compute",
    form,
  );
};
