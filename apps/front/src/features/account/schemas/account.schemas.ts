import * as z from "zod";
import { passwordRules } from "@/shared/schemas/password.schema";

// Édition du profil. avatarUrl accepte une URL valide ou une chaîne vide.
export const profileSchema = z.object({
  username: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  email: z.email("Email invalide"),
  bio: z
    .string()
    .max(500, "La bio ne peut pas dépasser 500 caractères")
    .optional(),
  avatarUrl: z
    .url("L'URL de l'avatar est invalide")
    .or(z.literal(""))
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Changement de mot de passe (mêmes règles que l'inscription).
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: passwordRules,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmNewPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
