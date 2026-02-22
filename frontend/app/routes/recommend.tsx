import { PageLayout } from "~/components/layout/PageLayout";
import { RecommendationWizard } from "~/components/recommend/RecommendationWizard";

export function meta() {
  return [
    { title: "Wanderlust - Recommander une destination" },
    { name: "description", content: "Trouve la destination idéale selon tes préférences." },
  ];
}

export default function Recommend() {
  return (
    <PageLayout>
      <RecommendationWizard />
    </PageLayout>
  );
}
