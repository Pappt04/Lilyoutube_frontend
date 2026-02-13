import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PostService } from '../user/services/post.service';
import { AuthService } from '../../core/auth/auth.service';
import { WatchPartyStateService } from '../video/services/watch-party-state.service';
import { Observable, map } from 'rxjs';
import { VideoPost } from '../../domain/model/video-post.model';
import { PopularVideo } from '../../domain/model/popular-video.model';

import { SecureMediaPipe } from '../../shared/pipes/secure-media.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, SecureMediaPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private partyState = inject(WatchPartyStateService);

  videos$!: Observable<VideoPost[]>;
  popularVideos$!: Observable<PopularVideo[]>;
  isLoggedIn$ = this.authService.currentUser$;

  ngOnInit() {
    this.videos$ = this.postService.getVideos().pipe(
      map(videos =>
        [...videos].sort((a, b) =>
          new Date(b.createdAt ?? 0 as any).getTime() - new Date(a.createdAt ?? 0 as any).getTime()
        )
      )
    );

    // Load popular videos for authenticated users
    this.popularVideos$ = this.postService.getPopularVideos();
  }

  navigateToVideo(videoPath: string, videoId?: number) {
    let parts = videoPath.split('.');
    if (parts.length > 1) {
      videoPath = parts[0];
    }

    // If in a watch party and user is the creator, notify all members
    if (videoId && this.partyState.isCreator()) {
      console.log('Watch party creator selecting video, notifying members');
      this.partyState.notifyVideoChange(videoId, videoPath);
    }

    this.router.navigate(['/videos', videoPath]);
  }

  getThumbnailUrl(filename: string): string | null {
    if (!filename) return null;
    return this.postService.getThumbnailUrl(filename);
  }
}
