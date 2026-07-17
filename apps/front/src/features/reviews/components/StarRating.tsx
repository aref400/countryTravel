import { useRef, useState } from "react";

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  /** Si absent, le composant est en lecture seule. */
  onChange?: (value: number) => void;
  /** Nom accessible du groupe en mode interactif. */
  label?: string;
}

/**
 * Notation 1 à 5 étoiles.
 * - Lecture seule (pas de onChange) : simple image annoncée "Note : x sur 5".
 * - Interactif : pattern radiogroup — une seule tabulation pour le groupe,
 *   flèches pour changer de note (comme des boutons radio natifs).
 */
export function StarRating({ value, onChange, label }: Readonly<StarRatingProps>) {
  const [hovered, setHovered] = useState(0);
  const starRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (!onChange) {
    return (
      <span
        role="img"
        aria-label={`Note : ${value} sur 5`}
        className="text-amber-500"
      >
        {"★".repeat(value)}
        <span className="text-gray-300">{"★".repeat(5 - value)}</span>
      </span>
    );
  }

  const displayed = hovered || value;

  const moveTo = (star: number) => {
    onChange(star);
    starRefs.current[star - 1]?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(Math.min(value + 1, 5));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(Math.max(value - 1, 1));
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={label ?? "Note sur 5"}
      className="flex gap-0.5"
      onMouseLeave={() => setHovered(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          ref={(el) => {
            starRefs.current[star - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} sur 5`}
          // Une seule étoile tabulable : celle sélectionnée (ou la 1ère si
          // aucune note) — le reste se parcourt aux flèches
          tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
          onClick={() => onChange(star)}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setHovered(star)}
          className={`text-2xl leading-none transition-colors ${
            star <= displayed ? "text-amber-500" : "text-gray-300"
          } hover:scale-110 focus-visible:outline-2 focus-visible:outline-green-600 rounded`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
