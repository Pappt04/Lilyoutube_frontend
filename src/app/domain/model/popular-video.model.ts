import { VideoPost } from './video-post.model';

export interface PopularVideo {
  id: number;
  pipelineExecutionTime: Date;
  post: VideoPost;
  popularityScore: number;
  rank: number;
}
