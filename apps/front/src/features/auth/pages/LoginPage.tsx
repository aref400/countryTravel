import { Link } from "react-router";
import { LoginForm } from "../components/LoginForm";

export const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-sm px-4 flex flex-col items-center gap-6">
        <LoginForm />
        <p className="text-sm text-gray-400">
          Besoin d'aide ?{" "}
          <Link to="/aide" className="text-green-600 hover:underline">
            Contactez-nous
          </Link>
        </p>
      </div>
    </div>
  );
};
