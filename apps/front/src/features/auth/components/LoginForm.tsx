import { useAuthStore } from "@/shared/store/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import type { LoginFormData } from "../schemas/auth.schemas";
import { loginSchema } from "../schemas/auth.schemas";
import { loginUser } from "../services/auth.service";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);
  // ?expired=1 : l'utilisateur a été redirigé ici suite à une session expirée
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const result = await loginUser(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate("/");
    } catch (err: unknown) {
      const error = err as { status: number; data: { message: string } };
      if (error.status === 401) {
        setApiError("Email ou mot de passe incorrect.");
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
        <h2 className="text-2xl font-bold text-heading">Bienvenue</h2>
        <p className="text-sm text-gray-400 mt-1">
          Connectez-vous pour continuer votre{" "}
          <span className="text-green-500 font-medium">aventure</span> avec{" "}
          <span className="text-green-500 font-medium">CountryTravel</span>.
        </p>
      </div>

      {sessionExpired && (
        <p
          role="alert"
          className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mb-4"
        >
          Votre session a expiré, veuillez vous reconnecter.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="email"
                className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-300"
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
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Mot de passe
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs text-green-500 hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-green-500 rounded"
            />
            <span className="text-sm text-gray-500">Se souvenir de moi</span>
          </label>
        </div>
        {apiError && (
          <p role="alert" className="text-red-500 text-xs text-center mt-2">
            {apiError}
          </p>
        )}
        <button
          className="w-full mt-5 bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold py-2.5 rounded-lg text-sm"
          type="submit"
        >
          Se connecter
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Vous n'avez pas de compte ?{" "}
        <Link
          to="/auth/register"
          className="text-green-500 font-medium hover:underline"
        >
          S'inscrire
        </Link>
      </p>
    </div>
  );
};
