import { apiClient } from "@/shared/lib/fetch.instance";
import type { MyReview, SavedReco, Visit } from "../types";

export const getMyVisits = () => {
  return apiClient.get<Visit[]>("/v1/users/me/visits");
};

export const deleteVisit = (countryId: string) => {
  return apiClient.delete<Visit>(`/v1/visits/${countryId}`);
};

export const getMyReviews = () => {
  return apiClient.get<MyReview[]>("/v1/reviews/me");
};

export const getSavedRecommendations = () => {
  return apiClient.get<SavedReco[]>("/v1/recommendations/saved");
};

export const deleteSavedRecommendation = (id: string) => {
  return apiClient.delete<SavedReco>(`/v1/recommendations/saved/${id}`);
};
