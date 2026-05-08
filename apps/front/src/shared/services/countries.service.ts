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

export interface CountryFilters {
  search?: string;
  continent?: string;
  currency?: string;
  page?: number;
  limit?: number;
}

export const getCountries = (filters: CountryFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.continent) params.set("continent", filters.continent);
  if (filters.currency) params.set("currency", filters.currency);
  return apiClient.get<CountriesResponse>(`/v1/countries?${params.toString()}`);
};

export interface CountryCriteria {
  budget: number;
  safety: number;
  temperature: number;
  tourismLevel: number;
  familyFriendly: boolean;
  natureLevel: number;
  partyLevel: number;
  sportLevel: number;
  cultureLevel: number;
  historyLevel: number;
  gastronomyLevel: number;
  cityLevel: number;
  relaxationLevel: number;
}

export interface CountryDetail extends Country {
  capital: string | null;
  criteria: CountryCriteria | null;
  avgRating: number | null;
  nbReviews: number;
}

export const getCountryByIsoCode = (isoCode: string) =>
  apiClient.get<CountryDetail>(`/v1/countries/${isoCode}`);
