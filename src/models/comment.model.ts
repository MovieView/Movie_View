export interface IComment {
  userId: string;
  content: string;
  createdAt: string;
  filePath: string;
  id: string;
  nickname: string;
  updatedAt: string;
}

export interface ICommentList {
  comments: IComment[];
  pagination: IPagination;
}

export interface IPagination {
  currentPage: number;
  totalCount: number;
}

export interface ICommentContent {
  content: string;
}

export interface ICommentData {
  reviewId: string;
  commentId: string;
  content: string;
}
