import { VideoPost } from "./video-post.model";

export interface PopularVideo {
    id: number;
    video: VideoPost;
    popularityScore: number;
    runTime: string;
}
