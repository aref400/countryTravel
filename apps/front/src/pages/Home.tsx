import { CTABanner } from "@/features/home/components/CTABanner";
import { HeroSection } from "@/features/home/components/HeroSection";
import { RecommendedCountries } from "@/features/home/components/RecommendedCountries";

export function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <RecommendedCountries />
      <CTABanner />
      <footer className="text-center text-xs text-gray-400 py-6">
        © 2024 CountryTravel. Prêt pour l'aventure.
      </footer>
    </div>
  );
}
