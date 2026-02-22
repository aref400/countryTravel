type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}
