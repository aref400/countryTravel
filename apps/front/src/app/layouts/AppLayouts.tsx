import { Outlet } from "react-router";
import { Navbar } from "../components/Navbar";

export const AppLayouts = () => {
  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#f0fdf4" }}
    >
      {/* blobs décoratifs */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 sm:w-96 sm:h-96 sm:-top-24 sm:-left-24 rounded-full opacity-40 z-0"
        style={{
          background: "radial-gradient(circle, #bbf7d0 0%, #f0fdf4 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-10 w-40 h-40 sm:w-80 sm:h-80 sm:-bottom-24 sm:-right-16 rounded-full opacity-50 z-0"
        style={{
          background: "radial-gradient(circle, #86efac 0%, #f0fdf4 70%)",
        }}
      />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};
