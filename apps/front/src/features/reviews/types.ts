export interface CountryReview {
  id: string;
  userId: string;
  countryId: string;
  rating: number;
  content: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface UpsertReviewPayload {
  countryId: string;
  rating: number;
  content?: string;
}
