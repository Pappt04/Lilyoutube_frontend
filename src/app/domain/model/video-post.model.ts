export interface VideoPost {
  id?: number;
  user_id: number;
  title: string;
  description: string;
  tags: string[];
  location: string;
  videoPath: string;
  thumbnailPath: string;
  likesCount: number;
  commentsCount: number;
  createdAt?: string;
}
