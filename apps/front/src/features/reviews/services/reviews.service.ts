import { apiClient } from "@/shared/lib/fetch.instance";
import type { CountryReview, UpsertReviewPayload } from "../types";

export const getCountryReviews = (isoCode: string) => {
  return apiClient.get<CountryReview[]>(`/v1/reviews/country/${isoCode}`);
};

export const upsertReview = (payload: UpsertReviewPayload) => {
  return apiClient.post<CountryReview>("/v1/reviews", payload);
};

export const deleteReview = (id: string) => {
  return apiClient.delete<CountryReview>(`/v1/reviews/${id}`);
};
