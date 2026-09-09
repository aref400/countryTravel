import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { DeleteAccountCard } from "../components/DeleteAccountCard";
import { PasswordForm } from "../components/PasswordForm";
import { ProfileForm } from "../components/ProfileForm";
import { useMyProfile } from "../hooks/useMyProfile";

export function AccountPage() {
  usePageTitle("Mon compte");
  const { profile, loading, error } = useMyProfile();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-2">
        Mon compte
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Gérer mon compte
      </h1>
      <p className="text-sm text-gray-500 mt-2 max-w-xl">
        Modifiez vos informations, votre mot de passe, ou supprimez
        définitivement votre compte.
      </p>

      {loading && (
        <div className="flex justify-center py-16" role="status">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Chargement…</span>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-8 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
        >
          Impossible de charger votre profil. Réessaie plus tard.
        </p>
      )}

      {profile && (
        <div className="flex flex-col gap-5 mt-8">
          <section
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7"
            aria-labelledby="profile-heading"
          >
            <div className="mb-5">
              <h2
                id="profile-heading"
                className="text-xs font-bold tracking-wider uppercase text-gray-900"
              >
                Profil
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Ces informations vous identifient sur CountryTravel.
              </p>
            </div>
            <ProfileForm
              defaultValues={{
                username: profile.username,
                email: profile.email,
                bio: profile.bio ?? "",
                avatarUrl: profile.avatarUrl ?? "",
              }}
            />
          </section>

          <section
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-7"
            aria-labelledby="password-heading"
          >
            <div className="mb-5">
              <h2
                id="password-heading"
                className="text-xs font-bold tracking-wider uppercase text-gray-900"
              >
                Mot de passe
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Après modification, vous devrez vous reconnecter.
              </p>
            </div>
            <PasswordForm />
          </section>

          <section
            className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 sm:p-7"
            style={{ background: "#fffbfb" }}
            aria-labelledby="danger-heading"
          >
            <div className="mb-5">
              <h2
                id="danger-heading"
                className="text-xs font-bold tracking-wider uppercase text-red-600"
              >
                Zone de danger
              </h2>
            </div>
            <DeleteAccountCard />
          </section>
        </div>
      )}
    </div>
  );
}
