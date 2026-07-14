import { apiClient } from "@/shared/lib/fetch.instance";
import type {
  CountriesResponse,
  CountryDetail,
  CountryFilters,
  CountryMapData,
} from "../types/CountryType";

export const getCountries = (filters: CountryFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.search) params.set("search", filters.search);
  if (filters.continent) params.set("continent", filters.continent);
  if (filters.currency) params.set("currency", filters.currency);
  return apiClient.get<CountriesResponse>(`/v1/countries?${params.toString()}`);
};

export const getCountryByIsoCode = (isoCode: string) =>
  apiClient.get<CountryDetail>(`/v1/countries/${isoCode}`);

export const getMapData = () =>
  apiClient.get<CountryMapData[]>(`/v1/countries/map/all`);
