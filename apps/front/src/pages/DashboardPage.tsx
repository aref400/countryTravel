import { MyReviewsList } from "@/features/dashboard/components/MyReviewsList";
import { PersonalMap } from "@/features/dashboard/components/PersonalMap";
import { SavedRecosList } from "@/features/dashboard/components/SavedRecosList";
import { StatsCards } from "@/features/dashboard/components/StatsCards";
import { VisitsList } from "@/features/dashboard/components/VisitsList";
import { useMyReviews } from "@/features/dashboard/hooks/useMyReviews";
import { useMyVisits } from "@/features/dashboard/hooks/useMyVisits";
import { useSavedRecos } from "@/features/dashboard/hooks/useSavedRecos";
import { ErrorState } from "@/shared/components/ErrorState";
import { useAuthStore } from "@/shared/store/auth.store";

function SectionCard({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="bg-white border border-gray-100 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuthStore();
  const visitsState = useMyVisits();
  const reviewsState = useMyReviews();
  const recosState = useSavedRecos();

  const loading =
    visitsState.loading || reviewsState.loading || recosState.loading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
      <header>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-green-600 uppercase mb-3">
          Tableau de bord
        </span>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour {user?.username}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Retrouvez vos pays visité, vos avis et vos recommandations.
        </p>
      </header>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm animate-pulse">
          Chargement de votre tableau de bord...
        </div>
      ) : (
        <>
          <StatsCards
            nbVisits={visitsState.visits.length}
            nbReviews={reviewsState.reviews.length}
            nbSavedRecos={recosState.recos.length}
          />

          <SectionCard title="Ma carte du monde">
            {visitsState.error ? (
              <ErrorState
                message={visitsState.error}
                onRetry={visitsState.refetch}
              />
            ) : (
              <PersonalMap visits={visitsState.visits} />
            )}
          </SectionCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title="Mes pays visités">
              {visitsState.error ? (
                <ErrorState
                  message={visitsState.error}
                  onRetry={visitsState.refetch}
                />
              ) : (
                <VisitsList
                  visits={visitsState.visits}
                  onRemove={visitsState.removeVisit}
                  removingId={visitsState.removingId}
                />
              )}
            </SectionCard>

            <div className="flex flex-col gap-6">
              <SectionCard title="Mes avis">
                {reviewsState.error ? (
                  <ErrorState
                    message={reviewsState.error}
                    onRetry={reviewsState.refetch}
                  />
                ) : (
                  <MyReviewsList reviews={reviewsState.reviews} />
                )}
              </SectionCard>

              <SectionCard title="Mes recommandations sauvegardées">
                {recosState.error ? (
                  <ErrorState
                    message={recosState.error}
                    onRetry={recosState.refetch}
                  />
                ) : (
                  <SavedRecosList
                    recos={recosState.recos}
                    onRemove={recosState.removeReco}
                    removingId={recosState.removingId}
                  />
                )}
              </SectionCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
