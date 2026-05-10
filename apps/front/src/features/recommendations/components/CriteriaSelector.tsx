interface CriteriaSelectorProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

const LABELS = [
  "",
  "Pas du tout",
  "Un peu",
  "Modéré",
  "Beaucoup",
  "Enormément",
];

export function CriteriaSelector({
  label,
  description,
  value,
  onChange,
}: CriteriaSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-semibold text-gray-800 text-sm">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
              value === n
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600"
            }`}
          >
            {LABELS[n]}
          </button>
        ))}
      </div>
    </div>
  );
}
