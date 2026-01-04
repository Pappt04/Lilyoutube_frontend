import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../../user/services/post.service';
import { VideoPost } from '../../../../domain/model/video-post.model';
import { Observable, switchMap, tap } from 'rxjs';

interface Comment {
    user: string;
    text: string;
    date: Date;
}

@Component({
    selector: 'app-video-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './video-page.component.html',
    styleUrl: './video-page.component.css'
})
export class VideoPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private postService = inject(PostService);

    video$!: Observable<VideoPost>;
    liked = false;
    currentLikes = 0;
    comments: Comment[] = [];

    ngOnInit() {
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
            })
        );
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
