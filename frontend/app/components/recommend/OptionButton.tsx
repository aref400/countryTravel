import { CheckCircle2 } from "lucide-react";

type OptionButtonProps = {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  showCheck?: boolean;
  className?: string;
};

export function OptionButton({
  selected,
  onClick,
  children,
  showCheck = false,
  className = "",
}: OptionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
        selected
          ? "bg-sky-500/20 border-sky-500 text-sky-400"
          : "bg-white/5 border-white/10 text-slate-300 hover:border-sky-500/40"
      } ${className}`}
    >
      <span>{children}</span>
      {showCheck && selected && (
        <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
      )}
    </button>
  );
}
