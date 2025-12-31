export interface Comment {
  id: number;
  user_id: number;
  username: string;
  post_id: number;
  text: string;
  createdAt: string;
  likesCount: number;
}

export interface CommentPage {
  content: Comment[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

