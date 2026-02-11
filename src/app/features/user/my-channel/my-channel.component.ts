import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { PostService } from '../services/post.service';
import { VideoPost } from '../../../domain/model/video-post.model';
import { SecureMediaPipe } from '../../../shared/pipes/secure-media.pipe';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-my-channel',
  standalone: true,
  imports: [CommonModule, SecureMediaPipe],
  templateUrl: './my-channel.component.html',
  styleUrl: './my-channel.component.css'
})
export class MyChannelComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private postService = inject(PostService);

  user = this.auth.currentUser;
  videos$!: Observable<VideoPost[]>;

  ngOnInit() {
    this.loadVideos();
  }

  loadVideos() {
    this.videos$ = this.postService.getUserVideos().pipe(
      map(videos =>
        [...videos].sort((a, b) =>
          new Date(b.createdAt ?? 0 as any).getTime() - new Date(a.createdAt ?? 0 as any).getTime()
        )
      )
    );
  }

  navigateToNewVideo() {
    this.router.navigate(['/my-channel/new-video']);
  }

  navigateToVideo(videoPath: string) {
    let parts = videoPath.split('.');
    if (parts.length > 1) {
      videoPath = parts[0];
    }
    this.router.navigate(['/videos', videoPath]);
  }

  editVideo(videoId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/my-channel/edit-video', videoId]);
  }

  deleteVideo(videoId: number, videoTitle: string, event: Event) {
    event.stopPropagation();

    if (confirm(`Are you sure you want to delete "${videoTitle}"? This action cannot be undone.`)) {
      this.postService.deletePost(videoId).subscribe({
        next: () => {
          this.loadVideos();
        },
        error: (err) => {
          console.error('Failed to delete video:', err);
          alert('Failed to delete video. Please try again.');
        }
      });
    }
  }

  getThumbnailUrl(filename: string): string | null {
    if (!filename) return null;
    return this.postService.getThumbnailUrl(filename);
  }
}
