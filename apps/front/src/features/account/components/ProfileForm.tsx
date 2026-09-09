import { Avatar } from "@/shared/components/Avatar";
import type { ApiError } from "@/shared/lib/fetch.instance";
import { useAuthStore } from "@/shared/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Image, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  profileSchema,
  type ProfileFormData,
} from "../schemas/account.schemas";
import { updateProfile } from "../services/account.service";

const inputClass =
  "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300";

interface Props {
  defaultValues: ProfileFormData;
}

export function ProfileForm({ defaultValues }: Readonly<Props>) {
  const { setUser } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const [bioValue = "", usernameValue, avatarUrlValue] = useWatch({
    control,
    name: ["bio", "username", "avatarUrl"],
  });

  const displayedUsername = usernameValue || defaultValues.username;

  const onSubmit = async (data: ProfileFormData) => {
    setApiError(null);
    setIsSaved(false);
    try {
      const updatedProfile = await updateProfile({
        username: data.username,
        email: data.email,
        bio: data.bio,
        avatarUrl: data.avatarUrl || undefined,
      });
      setUser({
        id: updatedProfile.id,
        email: updatedProfile.email,
        username: updatedProfile.username,
        role: updatedProfile.role,
        avatarUrl: updatedProfile.avatarUrl,
      });
      setIsSaved(true);
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 409) {
        const msg = error.data?.message;
        setApiError(
          msg === "Username already in use"
            ? "Ce nom d'utilisateur est déjà pris."
            : "Cet email est déjà utilisé.",
        );
      } else {
        setApiError("Une erreur est survenue. Réessaie plus tard.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-center gap-4 mb-5">
        <Avatar
          username={displayedUsername}
          avatarUrl={avatarUrlValue}
          className="w-14 h-14 text-lg shrink-0"
        />
        <div className="flex-1 flex flex-col gap-1">
          <label
            htmlFor="avatarUrl"
            className="text-sm font-semibold text-gray-700"
          >
            URL de l'avatar
          </label>
          <div className="relative">
            <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="avatarUrl"
              className={inputClass}
              type="url"
              placeholder="https://…/photo.jpg"
              aria-invalid={!!errors.avatarUrl}
              aria-describedby={
                errors.avatarUrl ? "avatarUrl-error" : "avatarUrl-hint"
              }
              {...register("avatarUrl")}
            />
          </div>
          {errors.avatarUrl ? (
            <p
              id="avatarUrl-error"
              role="alert"
              className="text-red-500 text-xs"
            >
              {errors.avatarUrl.message}
            </p>
          ) : (
            <span id="avatarUrl-hint" className="text-xs text-gray-400">
              Laissez vide pour afficher vos initiales.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="username"
            className="text-sm font-semibold text-gray-700"
          >
            Nom d'utilisateur
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="username"
              className={inputClass}
              type="text"
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              {...register("username")}
            />
          </div>
          {errors.username && (
            <p
              id="username-error"
              role="alert"
              className="text-red-500 text-xs"
            >
              {errors.username.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-gray-700"
          >
            Adresse e-mail
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              className={inputClass}
              type="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="email-error" role="alert" className="text-red-500 text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="bio" className="text-sm font-semibold text-gray-700">
            Bio
          </label>
          <div className="relative">
            <AtSign className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              id="bio"
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300 resize-y"
              placeholder="Parlez de vos voyages, vos pays préférés…"
              aria-invalid={!!errors.bio}
              aria-describedby="bio-count"
              {...register("bio")}
            />
          </div>
          <span
            id="bio-count"
            aria-live="polite"
            className="text-xs text-gray-400 text-right tabular-nums"
          >
            {bioValue.length} / 500
          </span>
          {errors.bio && (
            <p role="alert" className="text-red-500 text-xs">
              {errors.bio.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-5">
        {isSaved && (
          <span role="status" className="text-green-600 text-sm font-semibold">
            ✓ Modifications enregistrées
          </span>
        )}
        {apiError && (
          <span role="alert" className="text-red-500 text-sm">
            {apiError}
          </span>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold py-2.5 px-6 rounded-lg text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
