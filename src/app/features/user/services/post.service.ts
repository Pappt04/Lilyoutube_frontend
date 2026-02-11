import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../environments/environment";
import { Observable } from 'rxjs';
import { VideoPost } from '../../../domain/model/video-post.model';
import { PopularVideo } from '../../../domain/model/popular-video.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getVideos(): Observable<VideoPost[]> {
    return this.http.get<VideoPost[]>(`${this.baseUrl}/posts`);
  }

  getPopularVideos(): Observable<PopularVideo[]> {
    return this.http.get<PopularVideo[]>(`${this.baseUrl}/popular-videos`);
  }

  getPostById(id: string): Observable<VideoPost> {
    return this.http.get<VideoPost>(`${this.baseUrl}/posts/${id}`);
  }

  uploadVideoFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/media/upload-video`, formData, { responseType: 'text' });
  }

  uploadThumbnailFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/media/upload-picture`, formData, { responseType: 'text' });
  }

  createPostWithFiles(videoData: VideoPost, videoFile: File, thumbnailFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('post', JSON.stringify(videoData));
    formData.append('video', videoFile);
    formData.append('thumbnail', thumbnailFile);
    return this.http.post(`${this.baseUrl}/posts`, formData);
  }

  createPost(videoData: VideoPost): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts`, videoData);
  }

  getVideoUrl(name: string): string {
    return `${this.baseUrl}/media/videos/${name}`;
  }

  getThumbnailUrl(name: string): string {
    return `${this.baseUrl}/media/thumbnails/${name}`;
  }

  getVideoBlob(name: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/media/videos/${name}`, { responseType: 'blob' });
  }

  getThumbnailBlob(name: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/media/thumbnails/${name}`, { responseType: 'blob' });
  }

  incrementViewCount(postId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/view`, {});
  }

  likePost(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/like`, {});
  }

  unlikePost(postId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/posts/${postId}/unlike`, {});
  }

  isLiked(postId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/posts/${postId}/liked`);
  }

  getLikedVideos(): Observable<VideoPost[]> {
    return this.http.get<VideoPost[]>(`${this.baseUrl}/posts/liked`);
  }

  getUserVideos(): Observable<VideoPost[]> {
    return this.http.get<VideoPost[]>(`${this.baseUrl}/posts/user`);
  }

  deletePost(postId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/posts/${postId}`);
  }

  updatePost(postId: number, videoData: VideoPost): Observable<any> {
    return this.http.put(`${this.baseUrl}/posts/${postId}`, videoData);
  }
}
