import { RegisterForm } from "../components/RegisterForm";

export const RegisterPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-sm px-4">
        <RegisterForm />
      </div>
    </div>
  );
};
