import { useAuthStore } from "@/shared/store/auth.store";
import { setFlash } from "@/shared/lib/flash";
import type { ApiError } from "@/shared/lib/fetch.instance";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router";
import {
  passwordSchema,
  type PasswordFormData,
} from "../schemas/account.schemas";
import { updatePassword } from "../services/account.service";

const inputClass =
  "w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400";

interface FieldProps {
  id: keyof PasswordFormData;
  label: string;
  autoComplete: string;
  error?: string;
  register: UseFormRegister<PasswordFormData>;
}

function PasswordField({
  id,
  label,
  autoComplete,
  error,
  register,
}: Readonly<FieldProps>) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...register(id)}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          aria-label={
            show ? "Masquer le mot de passe" : "Afficher le mot de passe"
          }
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-red-500 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordForm() {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (data: PasswordFormData) => {
    setApiError(null);
    try {
      await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      // Le changement de mot de passe révoque les sessions côté serveur :
      // on déconnecte activement l'utilisateur et on le renvoie au login.
      setFlash("passwordChanged");
      clearAuth();
      navigate("/auth/login");
    } catch (err: unknown) {
      const error = err as ApiError;
      if (error.status === 401) {
        setApiError("Le mot de passe actuel est incorrect.");
      } else if (error.status === 400) {
        setApiError("Aucun mot de passe n'est défini sur ce compte.");
      } else {
        setApiError("Une erreur est survenue. Réessaie plus tard.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
          <PasswordField
            id="currentPassword"
            label="Mot de passe actuel"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            register={register}
          />
        </div>
        <PasswordField
          id="newPassword"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          register={register}
        />
        <PasswordField
          id="confirmNewPassword"
          label="Confirmer le nouveau mot de passe"
          autoComplete="new-password"
          error={errors.confirmNewPassword?.message}
          register={register}
        />
      </div>

      <div className="flex items-center justify-end gap-3 mt-5">
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
          {isSubmitting ? "Mise à jour…" : "Mettre à jour le mot de passe"}
        </button>
      </div>
    </form>
  );
}
