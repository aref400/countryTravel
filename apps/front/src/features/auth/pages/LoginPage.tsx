import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
  usePageTitle("Connexion");
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-sm px-4 flex flex-col items-center gap-6">
        <LoginForm />
      </div>
    </div>
  );
};
