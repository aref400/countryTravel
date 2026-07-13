import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCountries, getCountryByIsoCode } from "./countries.service";

describe("countries.service", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getCountries appelle /v1/countries avec les filtres en query params", async () => {
    const mockResponse = { data: [], total: 0, page: 1, limit: 20 };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getCountries({
      page: 2,
      limit: 10,
      continent: "Europe",
      search: "fra",
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/countries?"),
      expect.objectContaining({ method: "GET" }),
    );
    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toContain("page=2");
    expect(calledUrl).toContain("limit=10");
    expect(calledUrl).toContain("continent=Europe");
    expect(calledUrl).toContain("search=fra");
    expect(result).toEqual(mockResponse);
  });

  it("getCountries sans filtre n'ajoute aucun paramètre", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    await getCountries();

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(calledUrl).toBe("http://localhost:3000/api/v1/countries?");
  });

  it("getCountryByIsoCode appelle /v1/countries/:isoCode", async () => {
    const mockCountry = { isoCode: "FRA", name: "France" };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockCountry,
    } as Response);

    const result = await getCountryByIsoCode("FRA");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/countries/FRA",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result).toEqual(mockCountry);
  });

  it("propage une erreur exploitable quand le pays n'existe pas (404)", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Country not found" }),
    } as Response);

    await expect(getCountryByIsoCode("ZZZ")).rejects.toMatchObject({
      status: 404,
    });
  });
});
