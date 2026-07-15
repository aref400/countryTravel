import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "#dcfce7" }}
      >
        <span className="text-3xl" aria-hidden="true">
          🧭
        </span>
      </div>
      <p className="text-sm font-semibold tracking-widest text-green-600 uppercase mb-2">
        Erreur 404
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Cette destination n'existe pas
      </h1>
      <p className="text-sm text-gray-500 max-w-md mb-6">
        La page que vous cherchez est introuvable. Elle a peut-être été déplacée,
        ou l'adresse est incorrecte.
      </p>
      <Link
        to="/"
        className="text-sm font-semibold bg-green-500 hover:bg-green-600 transition-colors text-white px-5 py-2.5 rounded-lg"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
