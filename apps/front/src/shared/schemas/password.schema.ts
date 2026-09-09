import * as z from "zod";

// Politique de mot de passe partagée (inscription + changement de mot de passe),
// alignée sur la validation serveur : 8 caractères min, un chiffre, une majuscule.
export const passwordRules = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule");
