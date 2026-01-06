import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../user/services/post.service';
import { VideoPost } from '../../../../domain/model/video-post.model';
import { User } from '../../../../domain/model/user.model';
import { UserService } from '../../../user/services/user.service';
import { Observable, switchMap, tap, of, catchError } from 'rxjs';
import { SecureMediaPipe } from '../../../../shared/pipes/secure-media.pipe';

interface Comment {
    user: string;
    text: string;
    date: Date;
}

@Component({
    selector: 'app-video-page',
    standalone: true,
    imports: [CommonModule, SecureMediaPipe],
    templateUrl: './video-page.component.html',
    styleUrl: './video-page.component.css'
})
export class VideoPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postService = inject(PostService);
    private userService = inject(UserService);

    video$!: Observable<VideoPost>;
    author$!: Observable<User | null>;
    liked = false;
    currentLikes = 0;
    comments: Comment[] = [];
    private viewTracked = false;
    private videoName: string | null = null;
    private videoId: number | null = null;

    ngOnInit() {
        this.video$ = this.route.paramMap.pipe(
            switchMap(params => {
                this.videoName = params.get('id');
                if (!this.videoName) {
                    this.router.navigate(['/home']);
                    throw new Error('No video ID provided');
                }
                return this.postService.getPostById(this.videoName);
            }),
            tap((video: VideoPost) => {
                this.currentLikes = video.likesCount || 0;
                this.author$ = this.userService.getUserById(video.user_id).pipe(
                    catchError(() => of(null))
                );
            })
        );
    }

    onVideoPlay() {
        if (!this.viewTracked && this.videoName) {
            this.postService.incrementViewCount(this.videoName).subscribe({
                next: () => {
                    this.viewTracked = true;
                    console.log('View incremented');
                },
                error: (err: any) => console.error('Failed to increment view', err)
            });
        }
    }

    getVideoUrl(filename: string): string {
        return this.postService.getVideoUrl(filename);
    }

    toggleLike() {
        this.liked = !this.liked;
        this.currentLikes += this.liked ? 1 : -1;
    }

    addComment(commentInput: HTMLTextAreaElement) {
        if (commentInput.value.trim()) {
            this.comments.unshift({
                user: 'You',
                text: commentInput.value,
                date: new Date()
            });
            commentInput.value = '';
        }
    }
}
