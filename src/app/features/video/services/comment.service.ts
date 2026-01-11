import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { Comment, CommentPage } from '../../../domain/model/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getCommentsByPost(postId: number, page: number = 0, size: number = 20): Observable<CommentPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<CommentPage>(`${this.baseUrl}/comments/posts/${postId}`, { params });
  }

  createComment(postId: number, text: string, userId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/comments`, {
      post_id: postId,
      text: text,
      user_id: userId
    });
  }
}

