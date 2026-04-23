import { apiClient } from "@/shared/lib/fetch.instance";

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  description: string | null;
  continent: string;
  flagUrl: string | null;
}

export interface CountriesResponse {
  data: Country[];
  meta: { page: number; limit: number; total: number };
}

export const getCountries = (limit?: number) =>
  apiClient.get<CountriesResponse>(`/v1/countries?limit=${limit ?? 20}`);
