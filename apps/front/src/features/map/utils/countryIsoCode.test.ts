import { describe, expect, it } from "vitest";
import { getAlpha2FromNumericId } from "./countryIsoCode";

describe("getAlpha2FromNumericId", () => {
  it("retourne le code alpha-2 pour un id numérique connu", () => {
    expect(getAlpha2FromNumericId("250")).toBe("FR");
    expect(getAlpha2FromNumericId("578")).toBe("NO");
  });

  it("retourne undefined pour un id numérique inconnu", () => {
    expect(getAlpha2FromNumericId("999999")).toBeUndefined();
  });
});
