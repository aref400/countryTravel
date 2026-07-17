import { apiClient } from "@/shared/lib/fetch.instance";
import type { Visit } from "../types";

export const getMyVisits = () => {
  return apiClient.get<Visit[]>("/v1/users/me/visits");
};

export const addVisit = (countryId: string) => {
  return apiClient.post<Visit>("/v1/visits", { countryId });
};

export const deleteVisit = (countryId: string) => {
  return apiClient.delete<Visit>(`/v1/visits/${countryId}`);
};
