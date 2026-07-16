import { CTABanner } from "@/features/home/components/CTABanner";
import { HeroSection } from "@/features/home/components/HeroSection";
import { RecommendedCountries } from "@/features/home/components/RecommendedCountries";
import { useAuthStore } from "@/shared/store/auth.store";

export function Home() {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-screen">
      <HeroSection />
      <RecommendedCountries />
      {!isAuthenticated() && <CTABanner />}

      <footer className="text-center text-xs text-gray-400 py-6">
        © 2024 CountryTravel. Prêt pour l'aventure.
      </footer>
    </div>
  );
}
