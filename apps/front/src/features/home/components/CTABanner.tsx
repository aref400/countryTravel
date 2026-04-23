import { Link } from "react-router";

export function CTABanner() {
  return (
    <section className="px-4 max-w-5xl mx-auto mb-12">
      <div className="bg-white shadow-sm rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              Sauvegardez vos découvertes
            </p>
            <p className="text-xs text-gray-500">
              Créez un compte gratuit pour enregistrer vos pays favoris et
              obtenir des recommandations personnalisées.
            </p>
          </div>
        </div>

        <Link
          to="/auth/register"
          className="shrink-0 flex items-center gap-2 bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
        >
          Créer mon compte →
        </Link>
      </div>
    </section>
  );
}
