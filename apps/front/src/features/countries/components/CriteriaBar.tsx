interface CriteriaBarProps {
  label: string;
  value: number;
  max?: number;
}

export function CriteriaBar({ label, value, max = 5 }: CriteriaBarProps) {
  const percentage = (value / max) * 100;
  const color =
    value >= 4 ? "bg-green-500" : value >= 3 ? "bg-yellow-400" : "bg-red-400";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-6 text-right">
        {value}/{max}
      </span>
    </div>
  );
}
