import { describe, expect, it } from "vitest";
import { passwordSchema, profileSchema } from "./account.schemas";

describe("profileSchema", () => {
  it("accepte un profil valide (avatarUrl vide autorisé)", () => {
    const r = profileSchema.safeParse({
      username: "lucas",
      email: "lucas@test.com",
      bio: "Voyageur",
      avatarUrl: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejette un username trop court et un email invalide", () => {
    const r = profileSchema.safeParse({ username: "ab", email: "nope" });
    expect(r.success).toBe(false);
  });

  it("rejette une bio de plus de 500 caractères", () => {
    const r = profileSchema.safeParse({
      username: "lucas",
      email: "lucas@test.com",
      bio: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepte un mot de passe conforme et confirmé", () => {
    const r = passwordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "NewPass123",
      confirmNewPassword: "NewPass123",
    });
    expect(r.success).toBe(true);
  });

  it("rejette si la confirmation ne correspond pas", () => {
    const r = passwordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "NewPass123",
      confirmNewPassword: "Different1",
    });
    expect(r.success).toBe(false);
  });

  it("rejette un nouveau mot de passe sans majuscule ni chiffre", () => {
    const r = passwordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "tooweak",
      confirmNewPassword: "tooweak",
    });
    expect(r.success).toBe(false);
  });
});
