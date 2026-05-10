import { apiClient } from "@/shared/lib/fetch.instance";
import type { CountryDetail } from "@/shared/types/CountryType";

export const getRandomCountry = () => {
  return apiClient.get<CountryDetail>("/v1/countries/random");
};
