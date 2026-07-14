import { MAP_COLORS } from "../utils/colorScale";

const ITEMS = [
  { color: MAP_COLORS.high, label: "Bien noté" },
  { color: MAP_COLORS.medium, label: "Note moyenne" },
  { color: MAP_COLORS.low, label: "Mal noté" },
  { color: MAP_COLORS.noRating, label: "Pas encore noté" },
  { color: MAP_COLORS.unavailable, label: "Pas encore disponible" },
];

export function MapLegend() {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm px-3 py-2.5 text-xs text-gray-600"
      aria-label="Légende de la carte"
    >
      {ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
