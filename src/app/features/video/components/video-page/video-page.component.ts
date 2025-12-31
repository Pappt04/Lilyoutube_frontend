import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PostService } from '../../../user/services/post.service';
import { VideoPost } from '../../../../domain/model/video-post.model';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Comment, CommentPage } from '../../../../domain/model/comment.model';
import { Observable, switchMap, tap, BehaviorSubject, catchError, of } from 'rxjs';

@Component({
    selector: 'app-video-page',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './video-page.component.html',
    styleUrl: './video-page.component.css'
})
export class VideoPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postService = inject(PostService);
    private commentService = inject(CommentService);
    private authService = inject(AuthService);

    video$!: Observable<VideoPost>;
    liked = false;
    currentLikes = 0;
    comments: Comment[] = [];
    commentsPage$ = new BehaviorSubject<CommentPage | null>(null);
    currentPage = 0;
    loadingComments = false;
    errorMessage: string | null = null;
    isAuthenticated = false;
    currentPostId: number | null = null;

    ngOnInit() {
        this.isAuthenticated = this.authService.isAuthenticated();
        
        this.video$ = this.route.paramMap.pipe(
            switchMap(params => {
                const id = params.get('id');
                if (!id) {
                    this.router.navigate(['/home']);
                    throw new Error('No video ID provided');
                }
                return this.postService.getPostById(id);
            }),
            tap(video => {
                this.currentLikes = video.likesCount || 0;
                if (video.id !== undefined && video.id !== null) {
                    this.currentPostId = video.id;
                    this.loadComments(0);
                }
            })
        );
    }

    loadComments(page: number) {
        if (!this.currentPostId) return;
        
        this.loadingComments = true;
        this.errorMessage = null;
        
        this.commentService.getCommentsByPost(this.currentPostId, page).pipe(
            catchError(error => {
                this.errorMessage = 'Failed to load comments';
                this.loadingComments = false;
                return of(null);
            })
        ).subscribe(pageData => {
            if (pageData) {
                this.commentsPage$.next(pageData);
                this.comments = pageData.content;
                this.currentPage = page;
            }
            this.loadingComments = false;
        });
    }

    loadMoreComments() {
        const pageData = this.commentsPage$.value;
        if (pageData && !pageData.last) {
            this.loadComments(this.currentPage + 1);
        }
    }

    getVideoUrl(filename: string): string {
        return this.postService.getVideoUrl(filename);
    }

    toggleLike() {
        if (!this.isAuthenticated) {
            this.errorMessage = 'You must be logged in to like posts';
            return;
        }
        this.liked = !this.liked;
        this.currentLikes += this.liked ? 1 : -1;
    }

    addComment(commentInput: HTMLTextAreaElement) {
        if (!this.isAuthenticated) {
            this.errorMessage = 'You must be logged in to comment';
            return;
        }

        const text = commentInput.value.trim();
        if (!text || !this.currentPostId) {
            return;
        }

        const userId = this.authService.getCurrentUserId();
        if (!userId) {
            this.errorMessage = 'You must be logged in to comment';
            return;
        }

        this.loadingComments = true;
        this.errorMessage = null;

        this.commentService.createComment(this.currentPostId, text, userId).pipe(
            catchError(error => {
                if (error.status === 429) {
                    this.errorMessage = 'Maximum 60 comments per hour. Please try again later.';
                } else if (error.status === 401) {
                    this.errorMessage = 'You must be logged in to comment';
                } else {
                    this.errorMessage = 'Failed to post comment';
                }
                this.loadingComments = false;
                return of(null);
            })
        ).subscribe(comment => {
            if (comment) {
                // Reload comments from the first page to show the new comment
                this.loadComments(0);
                commentInput.value = '';
            }
        });
    }

    navigateToProfile(userId: number) {
        this.router.navigate(['/users', userId]);
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    }
}
