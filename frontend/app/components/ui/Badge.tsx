type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-blue-400/30 bg-blue-500/10 text-blue-300 ${className}`}
    >
      {children}
    </span>
  );
}
