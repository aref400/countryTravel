import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/home/HeroSection";
import type { UserStats } from "~/types";

export function meta() {
  return [
    { title: "Wanderlust - Votre prochain voyage commence ici" },
    {
      name: "description",
      content:
        "Découvrez des destinations inspirantes, planifiez vos aventures et partagez vos expériences.",
    },
  ];
}

const MOCK_STATS: UserStats = {
  visited: 8,
  wishlist: 5,
  available: 23,
};

export default function Home() {
  return (
    <PageLayout>
      <HeroSection stats={MOCK_STATS} />
    </PageLayout>
  );
}
