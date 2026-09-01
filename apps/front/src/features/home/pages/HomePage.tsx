import { CTABanner } from "@/features/home/components/CTABanner";
import { HeroSection } from "@/features/home/components/HeroSection";
import { RecommendedCountries } from "@/features/home/components/RecommendedCountries";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { useAuthStore } from "@/shared/store/auth.store";

export function HomePage() {
  const { isAuthenticated } = useAuthStore();
  usePageTitle("Accueil");
  return (
    <div className="min-h-screen">
      <HeroSection />
      <RecommendedCountries />
      {!isAuthenticated() && <CTABanner />}

      <footer className="text-center text-xs text-gray-500 py-6">
        © 2024 CountryTravel. Prêt pour l'aventure.
      </footer>
    </div>
  );
}
