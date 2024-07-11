export interface Review {
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

export interface Pagination {
  currentPage: number;
  totalCount: number;
}

export interface ReviewList {
  reviews: Review[];
  pagination: Pagination;
}

export interface ReviewFormData {
  title: string;
  rating: number;
  content: string;
}

export interface ReviewData {
  movieId: number;
  title: string;
  rating: number;
  content: string;
}
