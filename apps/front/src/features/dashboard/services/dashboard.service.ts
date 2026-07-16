import { apiClient } from "@/shared/lib/fetch.instance";
import type { MyReview, SavedReco } from "../types";

// Les appels visites appartiennent à la feature visits (partagés avec la
// fiche pays) — le dashboard les ré-expose pour ses propres hooks
export {
  deleteVisit,
  getMyVisits,
} from "@/features/visits/services/visits.service";

export const getMyReviews = () => {
  return apiClient.get<MyReview[]>("/v1/reviews/me");
};

export const getSavedRecommendations = () => {
  return apiClient.get<SavedReco[]>("/v1/recommendations/saved");
};

export const deleteSavedRecommendation = (id: string) => {
  return apiClient.delete<SavedReco>(`/v1/recommendations/saved/${id}`);
};
