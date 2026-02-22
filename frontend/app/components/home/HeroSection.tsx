import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { HeroBadge } from "./HeroBadge";
import { SearchBar } from "./SearchBar";
import { StatsBar } from "./StatsBar";
import { Button } from "../ui/Button";
import type { UserStats } from "~/types";

type HeroSectionProps = {
  stats: UserStats;
};

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] flex items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/80 to-gray-950/30" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="max-w-xl">
          <HeroBadge />

          <h1 className="mt-5 text-5xl font-extrabold leading-tight text-white">
            Votre prochain{" "}
            <span className="text-blue-400">voyage</span>{" "}
            commence ici
          </h1>

          <p className="mt-5 text-gray-400 text-base leading-relaxed max-w-sm">
            Découvrez des destinations inspirantes, planifiez vos aventures et
            partagez vos expériences avec une communauté de voyageurs passionnés.
          </p>

          <div className="mt-7">
            <Link to="/recommander">
              <Button variant="orange" size="lg" className="shadow-lg shadow-orange-500/20">
                <Zap size={16} />
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">
                    Trouver ma destination idéale
                  </p>
                  <p className="text-xs font-normal opacity-80 leading-tight">
                    Répondez à quelques questions, on s'occupe du reste
                  </p>
                </div>
                <ArrowRight size={16} className="ml-auto" />
              </Button>
            </Link>
          </div>

          <SearchBar />
          <StatsBar stats={stats} />
        </div>
      </div>
    </section>
  );
}
