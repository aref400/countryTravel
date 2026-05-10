import { About } from "@/pages/About";
import { CountriesPage } from "@/pages/CountriesPage";
import { CountryDetail } from "@/pages/CountryDetail";
import { Home } from "@/pages/Home";
import { Route, Routes } from "react-router";
import { authRoutes } from "../features/auth/auth.routes";
import { RandomPage } from "../pages/RandomPage";
import { RecommendationPage } from "../pages/RecommendationPage";
import { PrivateRoute } from "./components/PrivateRoute";
import { AppLayouts } from "./layouts/AppLayouts";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayouts />}>
        <Route path="/" element={<Home />} />
        <Route path="/pays" element={<CountriesPage />} />
        <Route path="/pays/:isoCode" element={<CountryDetail />} />
        <Route path="/recommandation" element={<RecommendationPage />} />
        <Route path="/random" element={<RandomPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/about" element={<About />} />
        </Route>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
}
