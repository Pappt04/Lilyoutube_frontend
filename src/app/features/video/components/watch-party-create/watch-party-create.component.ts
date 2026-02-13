import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { WatchPartyService } from '../../services/watch-party.service';
import { WatchPartyWebSocketService } from '../../services/watch-party-websocket.service';
import { WatchPartyStateService } from '../../services/watch-party-state.service';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { PostService } from '../../../user/services/post.service';
import { WatchParty } from '../../../../domain/model/watch-party.model';

@Component({
  selector: 'app-watch-party-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VideoPlayerComponent],
  templateUrl: './watch-party-create.component.html',
  styleUrl: './watch-party-create.component.css'
})
export class WatchPartyCreateComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private watchPartyService = inject(WatchPartyService);
  private wsService = inject(WatchPartyWebSocketService);
  private postService = inject(PostService);

  // Public for template access
  partyState = inject(WatchPartyStateService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  publicWatchParties = signal<WatchParty[]>([]);

  // Current video being watched in the party
  currentVideoUrl = signal<string | null>(null);
  currentVideoTitle = signal<string | null>(null);

  // Use the shared state for active party
  activeParty = this.partyState.activeParty;

  createForm: FormGroup = this.fb.group({
    publicRoom: [true, [Validators.required]]
  });

  joinForm: FormGroup = this.fb.group({
    roomCode: ['', [Validators.required, Validators.minLength(6)]]
  });

  videoLinkForm: FormGroup = this.fb.group({
    videoLink: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadPublicWatchParties();
    this.setupWebSocketListener();
  }

  ngOnDestroy() {
    // Disconnect WebSocket when component is destroyed
    if (this.activeParty()) {
      this.wsService.disconnect();
    }
  }

  /**
   * Setup WebSocket listener for video changes
   */
  setupWebSocketListener() {
    this.wsService.messages$.subscribe({
      next: (message) => {
        if (message.type === 'VIDEO_CHANGE') {
          console.log('Received video change notification:', message);

          // Load the video in the embedded player instead of navigating
          this.loadVideoInPlayer(message.videoPath, message.videoPath);
        }
      },
      error: (err) => {
        console.error('WebSocket message error:', err);
      }
    });

    this.wsService.connectionStatus$.subscribe({
      next: (connected) => {
        console.log('WebSocket connection status:', connected);
        if (connected) {
          // Load current video when connected
          this.loadCurrentPartyVideo();
        }
      },
      error: (err) => {
        console.error('WebSocket connection error:', err);
      }
    });
  }

  /**
   * Load current video from the active party
   */
  loadCurrentPartyVideo() {
    const party = this.activeParty();
    if (party && party.currentVideoId) {
      // Get video details from backend
      this.postService.getPostById(party.currentVideoId.toString()).subscribe({
        next: (video) => {
          this.loadVideoInPlayer(video.videoPath, party.currentVideoTitle!);
        },
        error: (err) => {
          console.error('Error loading party video:', err);
        }
      });
    }
  }

  /**
   * Load video in the embedded player
   */
  loadVideoInPlayer(videoPath: string, videoId: string) {
    // Remove file extension if present
    let cleanPath = videoPath.split('.')[0];

    // Construct video URL
    const videoUrl = this.postService.getVideoUrl(cleanPath + '.m3u8');
    this.currentVideoUrl.set(videoUrl);

    // Fetch video title
    this.postService.getPostById(videoId.toString()).subscribe({
      next: (video) => {
        this.currentVideoTitle.set(video.title);
        console.log('Loaded video in player:', video.title);
      },
      error: (err) => {
        console.error('Error fetching video details:', err);
        this.currentVideoTitle.set('Video #' + videoId);
      }
    });
  }

  /**
   * Load all public watch parties
   */
  loadPublicWatchParties() {
    this.watchPartyService.getPublicWatchParties().subscribe({
      next: (parties) => {
        this.publicWatchParties.set(parties);
      },
      error: (err) => {
        console.error('Error loading public watch parties:', err);
      }
    });
  }

  /**
   * Create a new watch party
   */
  onCreateParty() {
    if (this.createForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const publicRoom = this.createForm.value.publicRoom;

    this.watchPartyService.createWatchParty(publicRoom).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Watch party created:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Load current video if exists
        if (party.currentVideoId) {
          this.loadCurrentPartyVideo();
        }

        // Refresh public parties list
        this.loadPublicWatchParties();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to create watch party. Please try again.');
        console.error('Error creating watch party:', err);
      }
    });
  }

  /**
   * Join an existing watch party
   */
  onJoinParty() {
    if (this.joinForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const roomCode = this.joinForm.value.roomCode.trim().toUpperCase();

    this.watchPartyService.joinWatchParty(roomCode).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Joined watch party:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Load current video if exists
        if (party.currentVideoId) {
          this.loadCurrentPartyVideo();
        }

        // Reset form
        this.joinForm.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to join watch party. Please check the room code.');
        console.error('Error joining watch party:', err);
      }
    });
  }

  /**
   * Join a public watch party directly
   */
  joinPublicParty(roomCode: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.watchPartyService.joinWatchParty(roomCode).subscribe({
      next: (party) => {
        this.isLoading.set(false);
        console.log('Joined public watch party:', party);

        // Set active party in shared state (this will also connect WebSocket)
        this.partyState.setActiveParty(party);

        // Load current video if exists
        if (party.currentVideoId) {
          this.loadCurrentPartyVideo();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to join watch party.');
        console.error('Error joining watch party:', err);
      }
    });
  }

  /**
   * Leave the current watch party
   */
  leaveParty() {
    const party = this.activeParty();
    if (!party) return;

    this.isLoading.set(true);

    this.watchPartyService.leaveWatchParty(party.roomCode).subscribe({
      next: () => {
        this.isLoading.set(false);

        // Clear active party in shared state (this will also disconnect WebSocket)
        this.partyState.clearActiveParty();

        // Refresh public parties list
        this.loadPublicWatchParties();

        console.log('Left watch party');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Failed to leave watch party.');
        console.error('Error leaving watch party:', err);
      }
    });
  }

  /**
   * Copy room code to clipboard
   */
  copyRoomCode(roomCode: string) {
    navigator.clipboard.writeText(roomCode).then(() => {
      console.log('Room code copied to clipboard');
      // You could show a toast notification here
    }).catch(err => {
      console.error('Failed to copy room code:', err);
    });
  }

  /**
   * Send video link to all party members (creator only)
   */
  sendVideoLink() {
    if (this.videoLinkForm.invalid || !this.partyState.isCreator()) {
      return;
    }

    const videoLink = this.videoLinkForm.value.videoLink.trim();
    const party = this.activeParty();

    if (!party) {
      this.error.set('No active party');
      return;
    }

    // Extract video path from link
    // Assuming link format: http://localhost:4200/video/{videoPath}
    let videoPath = videoLink;

    // If it's a full URL, extract the path
    if (videoLink.includes('/video/')) {
      const parts = videoLink.split('/video/');
      if (parts.length > 1) {
        videoPath = parts[1];
      }
    }

    console.log('Sending video link:', videoPath);

    // Send via WebSocket
    this.wsService.sendVideoChange(party.roomCode, videoPath);

    // Also load it locally for the creator
    this.loadVideoInPlayer(videoPath, videoPath);

    // Clear the input
    this.videoLinkForm.reset();
  }
}

