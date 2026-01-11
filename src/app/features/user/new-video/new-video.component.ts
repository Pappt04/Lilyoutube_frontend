import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { AuthService } from '../../../core/auth/auth.service';
import { VideoPost } from '../../../domain/model/video-post.model';
import { EMPTY } from 'rxjs';
import { forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-new-video',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-video.component.html',
  styleUrl: './new-video.component.css'
})
export class NewVideoComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private postService = inject(PostService);
  private authService = inject(AuthService);

  videoForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required]],
    tags: ['', [Validators.required]],
    location: [''],
    thumbnail: [null, [Validators.required]],
    videoFile: [null, [Validators.required]]
  });

  videoError: string | null = null;
  thumbnailError: string | null = null;
  maxVideoSize = 200 * 1024 * 1024; // 200MB

  onVideoFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'video/mp4') {
        this.videoError = 'Only MP4 videos are allowed.';
        this.videoForm.patchValue({ videoFile: null });
        return;
      }
      if (file.size > this.maxVideoSize) {
        this.videoError = 'Video size must be less than 200MB.';
        this.videoForm.patchValue({ videoFile: null });
        return;
      }
      this.videoError = null;
      this.videoForm.patchValue({ videoFile: file });
    }
  }

  onThumbnailChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.thumbnailError = 'Please select a valid image file.';
        this.videoForm.patchValue({ thumbnail: null });
        return;
      }
      this.thumbnailError = null;
      this.videoForm.patchValue({ thumbnail: file });
    }
  }

  onSubmit() {
    if (this.videoForm.valid) {
      const videoFile = this.videoForm.get('videoFile')?.value;
      const thumbnailFile = this.videoForm.get('thumbnail')?.value;

      const user = this.authService.currentUser();
      if (!user) {
        alert('You must be logged in to upload a video.');
        return;
      }

      const videoData: VideoPost = {
        user_id: Number(user.id),
        title: this.videoForm.value.title,
        description: this.videoForm.value.description,
        tags: this.videoForm.value.tags.split(',').map((t: string) => t.trim()),
        location: this.videoForm.value.location,
        videoPath: '', // Will be set by server or handled in transactional flow
        thumbnailPath: '', // Will be set by server or handled in transactional flow
        commentsCount: 0,
        likesCount: 0,
      };

      this.postService.createPostWithFiles(videoData, videoFile, thumbnailFile).subscribe({
        next: (response) => {
          console.log('Upload successful:', response);
          alert('Video uploaded successfully!');
          this.router.navigate(['/my-channel']);
        },
        error: (err: any) => {
          console.error('Upload failed:', err);
          alert('Failed to upload video. Please try again.');
        }
      });
    } else {
      this.videoForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/my-channel']);
  }
}
