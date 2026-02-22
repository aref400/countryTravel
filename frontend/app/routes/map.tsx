import { PageLayout } from "~/components/layout/PageLayout";

export function meta() {
  return [
    { title: "Wanderlust - Carte" },
    { name: "description", content: "Explorez le monde sur la carte interactive." },
  ];
}

export default function MapPage() {
  return (
    <PageLayout>
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] text-gray-500">
        Carte interactive — à venir
      </div>
    </PageLayout>
  );
}
