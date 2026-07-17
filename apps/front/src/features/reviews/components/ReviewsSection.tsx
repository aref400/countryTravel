import { useVisitStatus } from "@/features/visits/hooks/useVisitStatus";
import { useAuthStore } from "@/shared/store/auth.store";
import { Link } from "react-router";
import { useCountryReviews } from "../hooks/useCountryReviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";

interface ReviewsSectionProps {
  countryId: string;
  isoCode: string;
  countryName: string;
}

export function ReviewsSection({
  countryId,
  isoCode,
  countryName,
}: Readonly<ReviewsSectionProps>) {
  const user = useAuthStore((state) => state.user);
  const visitStatus = useVisitStatus(countryId);
  const {
    reviews,
    myReview,
    loading,
    error,
    submitStatus,
    submitError,
    removingId,
    submitReview,
    removeReview,
  } = useCountryReviews(isoCode);

  const renderFormArea = () => {
    // État 1 : visiteur non connecté
    if (!user) {
      return (
        <p className="text-sm text-gray-600">
          <Link
            to="/auth/login"
            className="text-green-600 font-medium underline underline-offset-2"
          >
            Connectez-vous
          </Link>{" "}
          pour donner votre avis sur {countryName}.
        </p>
      );
    }

    if (visitStatus.loading) {
      return (
        <p className="text-sm text-gray-500 animate-pulse">Chargement...</p>
      );
    }

    // État 2 : connecté mais pays non visité
    if (!visitStatus.visited) {
      return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-sm text-gray-600">
            Vous devez avoir visité ce pays pour donner votre avis.
          </p>
          <button
            onClick={visitStatus.markVisited}
            disabled={visitStatus.adding}
            className="self-start px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-60"
          >
            {visitStatus.adding ? "Ajout..." : "J'ai déjà visité ce pays"}
          </button>
          {visitStatus.error && (
            <p role="alert" className="text-red-500 text-xs">
              {visitStatus.error}
            </p>
          )}
        </div>
      );
    }

    // État 3 : connecté + visité → formulaire (pré-rempli si avis existant)
    return (
      <ReviewForm
        key={myReview?.id ?? "new"}
        myReview={myReview}
        status={submitStatus}
        error={submitError}
        onSubmit={(rating, content) => submitReview(countryId, rating, content)}
      />
    );
  };

  return (
    <section
      aria-labelledby="reviews-title"
      className="bg-white rounded-2xl shadow-sm p-6 mt-6"
    >
      <h2
        id="reviews-title"
        className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4"
      >
        Avis voyageurs {reviews.length > 0 && `(${reviews.length})`}
      </h2>

      <div className="border-b border-gray-100 pb-5 mb-5">
        {renderFormArea()}
      </div>

      {(() => {
        if (loading) {
          return (
            <p className="text-sm text-gray-500 animate-pulse">
              Chargement des avis...
            </p>
          );
        }
        if (error) {
          return (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          );
        }
        if (reviews.length === 0) {
          return (
            <p className="text-sm text-gray-500">
              Aucun avis pour ce pays pour l'instant. Soyez le premier !
            </p>
          );
        }
        return (
          <div className="divide-y divide-gray-100">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isMine={review.userId === user?.id}
                onDelete={removeReview}
                deleting={removingId === review.id}
              />
            ))}
          </div>
        );
      })()}
    </section>
  );
}
