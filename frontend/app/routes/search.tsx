import { useSearchParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export function meta() {
  return [
    { title: "Wanderlust - Recherche" },
    { name: "description", content: "Recherchez un pays ou une destination." },
  ];
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return (
    <PageLayout className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-4">
        {query ? `Résultats pour "${query}"` : "Recherche"}
      </h1>
      <p className="text-gray-500">Résultats de recherche — à venir</p>
    </PageLayout>
  );
}
