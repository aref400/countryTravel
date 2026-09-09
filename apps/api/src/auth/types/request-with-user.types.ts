export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    avatarUrl: string | null;
  };
}
