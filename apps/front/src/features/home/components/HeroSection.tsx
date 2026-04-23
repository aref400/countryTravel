import { Link } from "react-router";

export function HeroSection() {
  return (
    <section className="max-w-5xl mx-auto w-full px-4 pt-16 pb-10">
      <div className="bg-white rounded-3xl shadow-sm px-8 py-12 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-green-600 uppercase mb-4">
          Explorer le monde
        </span>

        <h1 className="text-4xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          Trouvez votre prochaine
          <br />
          <span className="text-green-500">destination</span> parfaite.
        </h1>

        <p className="mt-4 text-gray-500 text-base sm:text-lg max-w-md leading-relaxed">
          Découvrez des destinations adaptées à vos envies, votre budget et
          votre soif d'exploration.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
          <Link
            to="/recommandation"
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors text-center text-sm"
          >
            Commencer
          </Link>
          <Link
            to="/random"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center text-sm"
          >
            Destination aléatoire
          </Link>
        </div>
      </div>
    </section>
  );
}
