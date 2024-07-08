export interface Comment {
  userId: string;
  content: string;
  createdAt: string;
  filePath: string;
  id: string;
  nickname: string;
  updatedAt: string;
}

export interface CommentList {
  comments: Comment[];
  pagination: Pagination;
}

export interface Pagination {
  currentPage: number;
  totalCount: number;
}

export interface CommentContent {
  content: string;
}
