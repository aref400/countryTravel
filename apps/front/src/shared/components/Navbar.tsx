import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../store/auth.store";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/pays?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setSearchOpen(false);
    }
  }

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 font-bold text-gray-900 text-base"
        >
          <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
            🌍
          </span>
          <span>
            Country<span className="text-green-500">Travel</span>
          </span>
        </Link>

        {/* Barre de recherche — desktop uniquement */}
        <div className="flex-1 hidden sm:flex">
          <div className="relative max-w-xs w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              placeholder="Où voulez-vous aller ?"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-green-300 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Liens nav — desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/" className="text-sm font-semibold text-green-600">
            Accueil
          </Link>
          <Link
            to="/recommandation"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Recommandation
          </Link>
          <Link
            to="/pays"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Page pays
          </Link>
          {isAuthenticated() ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <span>{user?.username}</span>
              </Link>
              <button
                onClick={logout}
                className="text-sm font-medium bg-red-500 hover:bg-red-600 transition-colors text-white px-4 py-1.5 rounded-lg"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Connexion
              </Link>
              <Link
                to="/auth/register"
                className="text-sm font-semibold bg-green-500 hover:bg-green-600 transition-colors text-white px-4 py-1.5 rounded-lg"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>

        {/* Icônes mobile : loupe + hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1 text-gray-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-gray-500"
          >
            {menuOpen ? (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Barre de recherche mobile dépliable */}
      {searchOpen && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              autoFocus
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
              placeholder="Où voulez-vous aller ?"
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-green-300 placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Menu mobile dépliable */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white">
          <Link
            to="/"
            className="text-sm font-semibold text-green-600"
            onClick={() => setMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link
            to="/recommandation"
            className="text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Recommandation
          </Link>
          <Link
            to="/pays"
            className="text-sm text-gray-600"
            onClick={() => setMenuOpen(false)}
          >
            Page pays
          </Link>
          <div className="border-t border-gray-100 pt-3 flex gap-2">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex-1 text-center text-sm font-medium border border-gray-200 text-gray-700 py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  {user?.username}
                </Link>
                <button
                  onClick={logout}
                  className="flex-1 text-center text-sm font-semibold bg-red-500 hover:bg-red-600 transition-colors text-white py-2 rounded-lg"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="flex-1 text-center text-sm font-medium border border-gray-200 text-gray-700 py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/auth/register"
                  className="flex-1 text-center text-sm font-semibold bg-green-500 text-white py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
