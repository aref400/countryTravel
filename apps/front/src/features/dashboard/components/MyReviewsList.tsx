import { Link } from "react-router";
import type { MyReview } from "../types";

interface MyReviewsListProps {
  reviews: MyReview[];
}

export function MyReviewsList({ reviews }: Readonly<MyReviewsListProps>) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        Aucun avis publié pour le moment.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reviews.map((review) => (
        <li key={review.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={`/pays/${review.country.isoCode}`}
              className="text-sm font-medium text-gray-900 hover:text-green-600"
            >
              {review.country.name}
            </Link>
            <span
              className="text-sm text-amber-500"
              aria-label={`Note : ${review.rating} sur 5`}
            >
              {"★".repeat(review.rating)}
              <span className="text-gray-200">
                {"★".repeat(5 - review.rating)}
              </span>
            </span>
          </div>
          {review.content && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {review.content}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
