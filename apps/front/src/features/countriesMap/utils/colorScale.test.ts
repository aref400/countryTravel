import { describe, expect, it } from "vitest";
import { getColorForRating } from "./colorScale";

describe("getColorForRating", () => {
  it("retourne le bleu quand le pays existe mais n'a pas encore de note", () => {
    expect(getColorForRating(null)).toBe("#3b82f6");
  });

  it("retourne le rouge pour une note basse", () => {
    expect(getColorForRating(1.5)).toBe("#ef4444");
  });

  it("retourne l'orange pour une note moyenne", () => {
    expect(getColorForRating(3)).toBe("#f59e0b");
  });

  it("retourne le vert pour une note haute", () => {
    expect(getColorForRating(4.8)).toBe("#22c55e");
  });

  it("traite les bornes des paliers correctement", () => {
    expect(getColorForRating(2)).toBe("#f59e0b");
    expect(getColorForRating(3.5)).toBe("#f59e0b");
  });
});
