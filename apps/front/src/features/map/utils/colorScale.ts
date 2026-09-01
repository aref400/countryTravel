export const MAP_COLORS = {
  unavailable: "#e5e7eb", // pays absent du catalogue
  noRating: "#3b82f6", // pays disponible, pas encore noté
  low: "#ef4444", // note basse
  medium: "#f59e0b", // note moyenne
  high: "#22c55e", // note haute
} as const;

export const getColorForRating = (avgRating: number | null): string => {
  if (avgRating === null) {
    return MAP_COLORS.noRating;
  } else if (avgRating < 2) {
    return MAP_COLORS.low;
  } else if (avgRating <= 3.5) {
    return MAP_COLORS.medium;
  } else {
    return MAP_COLORS.high;
  }
};
