import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
      const formData = {
        ...this.videoForm.value,
        createdAt: new Date().toISOString()
      };
      console.log('Video data to upload:', formData);
      // Here you would typically call a service to upload
      alert('Video upload started! (Check console for data)');
      this.router.navigate(['/my-channel']);
    } else {
      this.videoForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/my-channel']);
  }
}
