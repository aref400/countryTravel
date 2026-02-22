import { Navbar } from "./Navbar";

type PageLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className={`pt-14 ${className}`}>{children}</main>
    </div>
  );
}
