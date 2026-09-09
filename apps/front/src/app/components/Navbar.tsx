import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuthStore } from "@/shared/store/auth.store";
import { UserMenu } from "./UserMenu";

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
  const { pathname } = useLocation();

  return (
    <nav className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 font-bold text-gray-900 text-base"
        >
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
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-green-300 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Liens nav — desktop */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/"
            className={`text-sm  ${pathname === "/" ? "text-green-600 font-semibold" : "text-gray-500"}`}
          >
            Accueil
          </Link>
          <Link
            to="/recommandation"
            className={`text-sm ${pathname === "/recommandation" ? "text-green-600 font-semibold" : "text-gray-500"} hover:text-gray-700`}
          >
            Recommandation
          </Link>
          <Link
            to="/pays"
            className={`text-sm ${pathname === "/pays" ? "text-green-600 font-semibold" : "text-gray-500"} hover:text-gray-700`}
          >
            Page pays
          </Link>
          <Link
            to="/carte"
            className={`text-sm ${pathname === "/carte" ? "text-green-600 font-semibold" : "text-gray-500"} hover:text-gray-700`}
          >
            Carte
          </Link>
          {isAuthenticated() ? (
            <UserMenu
              username={user?.username ?? ""}
              avatarUrl={user?.avatarUrl}
              onLogout={() => void logout()}
            />
          ) : (
            <>
              <Link
                to="/auth/login"
                className={`text-sm font-medium ${pathname === "/auth/login" ? "text-green-600 font-semibold" : "text-gray-500"} hover:text-gray-900`}
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
            aria-label={
              searchOpen ? "Fermer la recherche" : "Ouvrir la recherche"
            }
            aria-expanded={searchOpen}
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
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
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
              className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-green-300 placeholder:text-gray-500"
            />
          </div>
        </div>
      )}

      {/* Menu mobile dépliable */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white">
          <Link
            to="/"
            className={`text-sm ${pathname === "/" ? "text-green-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link
            to="/recommandation"
            className={`text-sm ${pathname === "/recommandation" ? "text-green-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setMenuOpen(false)}
          >
            Recommandation
          </Link>
          <Link
            to="/pays"
            className={`text-sm ${pathname === "/pays" ? "text-green-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setMenuOpen(false)}
          >
            Page pays
          </Link>
          <Link
            to="/carte"
            className={`text-sm ${pathname === "/carte" ? "text-green-600 font-semibold" : "text-gray-500"}`}
            onClick={() => setMenuOpen(false)}
          >
            Carte
          </Link>
          <div className="border-t border-gray-100 pt-3 flex gap-2">
            {isAuthenticated() ? (
              <div className="flex-1 flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className="text-center text-sm font-medium border border-gray-200 text-gray-700 py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/mon-compte"
                  className="text-center text-sm font-medium border border-gray-200 text-gray-700 py-2 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  Mon compte
                </Link>
                <button
                  onClick={() => void logout()}
                  className="text-center text-sm font-semibold bg-red-500 hover:bg-red-600 transition-colors text-white py-2 rounded-lg"
                >
                  Déconnexion
                </button>
              </div>
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
