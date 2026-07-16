import { useState } from "react";
import type { SubmitStatus } from "../hooks/useCountryReviews";
import type { CountryReview } from "../types";
import { StarRating } from "./StarRating";

const CONTENT_MAX_LENGTH = 2000;

interface ReviewFormProps {
  myReview: CountryReview | null;
  status: SubmitStatus;
  error: string | null;
  onSubmit: (rating: number, content: string) => Promise<boolean>;
}

export function ReviewForm({
  myReview,
  status,
  error,
  onSubmit,
}: Readonly<ReviewFormProps>) {
  const [rating, setRating] = useState(myReview?.rating ?? 0);
  const [content, setContent] = useState(myReview?.content ?? "");
  const [ratingMissing, setRatingMissing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaved(false);
    if (rating === 0) {
      setRatingMissing(true);
      return;
    }
    setRatingMissing(false);
    const ok = await onSubmit(rating, content);
    if (ok) setSaved(true);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-gray-700">
          {myReview ? "Modifier ma note" : "Ma note"}
        </span>
        <StarRating
          value={rating}
          onChange={(value) => {
            setRating(value);
            setRatingMissing(false);
            setSaved(false);
          }}
          label="Ma note sur 5"
        />
      </div>
      {ratingMissing && (
        <p role="alert" className="text-red-500 text-xs">
          Choisissez une note avant de publier votre avis.
        </p>
      )}

      <div>
        <label
          htmlFor="review-content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mon avis{" "}
          <span className="text-gray-500 font-normal">(facultatif)</span>
        </label>
        <textarea
          id="review-content"
          value={content}
          onChange={(event) => {
            setContent(event.target.value);
            setSaved(false);
          }}
          maxLength={CONTENT_MAX_LENGTH}
          rows={4}
          placeholder="Racontez votre expérience dans ce pays..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
        />
        <p className="text-xs text-gray-500 text-right mt-0.5">
          {content.length}/{CONTENT_MAX_LENGTH}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-red-500 text-xs">
          {error}
        </p>
      )}
      {saved && status === "inactive" && (
        <p role="status" className="text-green-700 text-xs">
          ✓ Votre avis a bien été publié.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "saving"}
        className="self-start px-6 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {(() => {
          if (status === "saving") return "Publication…";
          return myReview ? "Mettre à jour mon avis" : "Publier mon avis";
        })()}
      </button>
    </form>
  );
}
