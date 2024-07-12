export interface IReview {
  id: string;
  movieId: number;
  userId: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  nickname: string;
  filePath: string | null;
  likes: number;
  liked: number;
  commentsCount: number;
}

export interface IPagination {
  currentPage: number;
  totalCount: number;
}

export interface IReviewList {
  reviews: IReview[];
  pagination: IPagination;
}

export interface IReviewFormData {
  title: string;
  rating: number;
  content: string;
}

export interface IReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
}
