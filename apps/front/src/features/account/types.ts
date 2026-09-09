export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  role: string;
  createdAt: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
