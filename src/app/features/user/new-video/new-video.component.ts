import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { VideoPost } from '../../../domain/model/video-post.model';
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

      forkJoin({
        videoPath: this.postService.uploadVideoFile(videoFile),
        thumbnailPath: this.postService.uploadThumbnailFile(thumbnailFile)
      }).pipe(
        switchMap(({ videoPath, thumbnailPath }) => {
          // Extract filenames if the response contains extra text (e.g. "Video uploaded successfully: <uuid>")
          const videoFilename = videoPath.split(': ').pop() || videoPath;
          const thumbnailFilename = thumbnailPath.split(': ').pop() || thumbnailPath;

          const videoData: VideoPost = {
            user_id: 1, // Temporarily hardcoded, should ideally come from an auth service
            title: this.videoForm.value.title,
            description: this.videoForm.value.description,
            tags: this.videoForm.value.tags.split(',').map((t: string) => t.trim()),
            location: this.videoForm.value.location,
            videoPath: videoFilename,
            thumbnailPath: thumbnailFilename
          };

          return this.postService.createPost(videoData);
        })
      ).subscribe({
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
