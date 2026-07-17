import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../../../shared/store/auth.store";
import type { RegisterFormData } from "../schemas/auth.schemas";
import { registerSchema } from "../schemas/auth.schemas";
import { registerUser } from "../services/auth.service";

const inputClass =
  "w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300";

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const result = await registerUser(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/");
    } catch (err: unknown) {
      const error = err as { status: number; data: { message: string } };
      if (error.status === 409) {
        const msg = error.data?.message;
        if (msg === "Email already exists") {
          setApiError("Cet email est déjà utilisé.");
        } else if (msg === "Username already exists") {
          setApiError("Ce nom d'utilisateur est déjà pris.");
        } else {
          setApiError("Compte déjà existant.");
        }
      } else {
        setApiError("Une erreur est survenue. Réessaie plus tard.");
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 w-full">
      <div className="flex justify-center mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "#dcfce7" }}
        >
          <span className="text-2xl">✈️</span>
        </div>
      </div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-heading">Rejoignez-nous</h2>
        <p className="text-sm text-gray-500 mt-1">
          Créez votre compte pour commencer votre{" "}
          <span className="text-green-500 font-medium">aventure</span> avec{" "}
          <span className="text-green-500 font-medium">CountryTravel</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="username"
                className={inputClass}
                type="text"
                placeholder="Username"
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? "username-error" : undefined}
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p id="username-error" role="alert" className="text-red-500 text-xs">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                className={inputClass}
                type="email"
                placeholder="vous@exemple.com"
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
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="password"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                type={showPassword ? "text" : "password"}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="text-red-500 text-xs">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="confirmPassword"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                type={showConfirm ? "text" : "password"}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={
                  showConfirm
                    ? "Masquer la confirmation du mot de passe"
                    : "Afficher la confirmation du mot de passe"
                }
              >
                {showConfirm ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                role="alert"
                className="text-red-500 text-xs"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-green-500"
              aria-invalid={!!errors.acceptTerms}
              aria-describedby={
                errors.acceptTerms ? "acceptTerms-error" : undefined
              }
              {...register("acceptTerms")}
            />
            <span className="text-xs text-gray-500">
              J'accepte les{" "}
              <Link to="/conditions" className="text-green-500 hover:underline">
                conditions d'aventure
              </Link>{" "}
              et la politique de confidentialité.
            </span>
          </label>
          {errors.acceptTerms && (
            <p id="acceptTerms-error" role="alert" className="text-red-500 text-xs -mt-2">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {apiError && (
          <p role="alert" className="text-red-500 text-xs text-center mt-2">
            {apiError}
          </p>
        )}
        <button
          type="submit"
          className="w-full mt-5 bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold py-2.5 rounded-lg text-sm"
        >
          Créer un compte
        </button>
      </form>
      <p className="text-center text-xs text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link
          to="/auth/login"
          className="text-green-500 font-medium hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
};
