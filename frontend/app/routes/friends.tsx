import { PageLayout } from "~/components/layout/PageLayout";

export function meta() {
  return [
    { title: "Wanderlust - Amis" },
    { name: "description", content: "Retrouvez vos amis voyageurs." },
  ];
}

export default function FriendsPage() {
  return (
    <PageLayout className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-white mb-4">Amis</h1>
      <p className="text-gray-500">Page amis — à venir</p>
    </PageLayout>
  );
}
