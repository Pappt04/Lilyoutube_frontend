import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../../environments/environment";
import { Observable } from 'rxjs';
import { VideoPost } from '../../../domain/model/video-post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getVideos(): Observable<VideoPost[]> {
    return this.http.get<VideoPost[]>(`${this.baseUrl}/posts`);
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

}
