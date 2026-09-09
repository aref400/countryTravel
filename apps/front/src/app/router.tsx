import { NotFoundPage } from "@/app/pages/NotFoundPage";
import { AccountPage } from "@/features/account";
import { authRoutes } from "@/features/auth";
import { CountriesPage, CountryDetailPage } from "@/features/countries";
import { DashboardPage } from "@/features/dashboard";
import { HomePage } from "@/features/home";
import { MapPage } from "@/features/map";
import { RandomPage } from "@/features/random";
import { RecommendationPage } from "@/features/recommendations";
import { Route, Routes } from "react-router";
import { PrivateRoute } from "./components/PrivateRoute";
import { AppLayouts } from "./layouts/AppLayouts";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayouts />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pays" element={<CountriesPage />} />
        <Route path="/pays/:isoCode" element={<CountryDetailPage />} />
        <Route path="/carte" element={<MapPage />} />
        <Route path="/recommandation" element={<RecommendationPage />} />
        <Route path="/random" element={<RandomPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mon-compte" element={<AccountPage />} />
        </Route>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
