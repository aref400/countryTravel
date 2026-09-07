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

export interface CountryMapData {
  isoCode: string;
  name: string;
  flagUrl: string | null;
  avgRating: number | null;
  nbReviews: number;
}
