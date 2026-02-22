import { useParams } from "react-router";
import { PageLayout } from "~/components/layout/PageLayout";

export function meta() {
  return [
    { title: "Wanderlust - Détail pays" },
    { name: "description", content: "Détails d'un pays." },
  ];
}

export default function CountryDetailPage() {
  const { isoCode } = useParams<{ isoCode: string }>();

  return (
    <PageLayout className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-4">
        Pays : {isoCode?.toUpperCase()}
      </h1>
      <p className="text-gray-500">Page de détail pays — à venir</p>
    </PageLayout>
  );
}
