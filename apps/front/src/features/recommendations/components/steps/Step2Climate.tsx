import type { FormChangeHandler, RecoFormDto } from "../../types";

interface Props {
  values: RecoFormDto;
  onChange: FormChangeHandler;
}

const TEMP_LABELS: Record<
  number,
  { label: string; emoji: string; desc: string }
> = {
  1: { label: "Froid", emoji: "🥶", desc: "Moins de 10°C" },
  2: { label: "Frais", emoji: "🧥", desc: "10 - 18°C" },
  3: { label: "Tempéré", emoji: "🌤️", desc: "18 - 24°C" },
  4: { label: "Chaud", emoji: "☀️", desc: "24 - 30°C" },
  5: { label: "Très chaud", emoji: "🔥", desc: "Plus de 30°C" },
};

export function Step2Climate({ values, onChange }: Props) {
  const current = TEMP_LABELS[values.temperature];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3 py-4">
        <span className="text-6xl transition-all duration-300">
          {current.emoji}
        </span>
        <p className="text-xl font-bold text-gray-800">{current.label}</p>
        <p className="text-sm text-gray-400">{current.desc}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange("temperature", n)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 ${
              values.temperature === n
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <span
              className={`text-[10px] font-semibold ${values.temperature === n ? "text-green-700" : "text-gray-400"}`}
            >
              {TEMP_LABELS[n].label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
