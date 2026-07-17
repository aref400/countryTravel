import type { CountryReview } from "../types";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: CountryReview;
  isMine: boolean;
  onDelete: (id: string) => void;
  deleting: boolean;
}

export function ReviewCard({
  review,
  isMine,
  onDelete,
  deleting,
}: Readonly<ReviewCardProps>) {
  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {review.user.avatarUrl ? (
            <img
              src={review.user.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center"
            >
              {review.user.username.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-sm font-medium text-gray-900 truncate">
            {review.user.username}
            {isMine && (
              <span className="ml-1.5 text-xs font-normal text-green-600">
                (vous)
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <StarRating value={review.rating} />
          {isMine && (
            <button
              onClick={() => onDelete(review.id)}
              disabled={deleting}
              aria-label="Supprimer mon avis"
              className="text-xs font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "..." : "Supprimer"}
            </button>
          )}
        </div>
      </div>
      {review.content && (
        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
          {review.content}
        </p>
      )}
      <p className="text-xs text-gray-500 mt-1.5">
        {new Date(review.updatedAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
    </article>
  );
}
