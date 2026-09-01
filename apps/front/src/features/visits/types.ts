import type { Country } from "@/features/countries";

export interface Visit {
  id: string;
  countryId: string;
  visitedAt: string | null;
  createdAt: string;
  country: Pick<Country, "id" | "isoCode" | "name" | "flagUrl" | "continent">;
}
