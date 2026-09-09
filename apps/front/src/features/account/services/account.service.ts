import { apiClient } from "@/shared/lib/fetch.instance";
import type {
  UpdatePasswordPayload,
  UpdateProfilePayload,
  UserProfile,
} from "../types";

export const getMyProfile = () => apiClient.get<UserProfile>("/v1/users/me");

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiClient.patch<UserProfile>("/v1/users/me", payload);

export const updatePassword = (payload: UpdatePasswordPayload) =>
  apiClient.patch<UserProfile>("/v1/users/me", payload);

export const deleteAccount = () => apiClient.delete<void>("/v1/users/me");
