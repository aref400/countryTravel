import { Link, useLocation } from "react-router";
import {
  Globe,
  Map,
  Star,
  Shuffle,
  Users,
  Search,
  User,
  LogOut,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/explorer", label: "Explorer", icon: Globe },
  { to: "/carte", label: "Carte", icon: Map },
  { to: "/recommander", label: "Recommander", icon: Star },
  { to: "/aleatoire", label: "Aléatoire", icon: Shuffle },
  { to: "/amis", label: "Amis", icon: Users },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
            <Globe size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-base tracking-tight">
            Wanderlust
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
            <Search size={16} />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <User size={14} className="text-gray-300" />
            <span className="text-sm text-gray-300 font-medium">Sophie</span>
          </div>
          <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
