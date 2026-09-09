import { apiClient } from "@/shared/lib/fetch.instance";
import type { LoginFormData, RegisterFormData } from "../schemas/auth.schemas";

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export const loginUser = (data: LoginFormData) =>
  apiClient.post<LoginResponse>("/v1/auth/login", data);

export const registerUser = (data: RegisterFormData) => {
  const { confirmPassword: _c, acceptTerms: _a, ...payload } = data;
  void _c;
  void _a;
  return apiClient.post<LoginResponse>("/v1/auth/register", payload);
};
