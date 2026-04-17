import { useAuthStore } from "@/shared/store/auth.store";
import { Navigate, Outlet } from "react-router";

export const PrivateRoute = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/login" replace />;
};
