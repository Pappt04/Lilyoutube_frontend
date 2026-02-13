import { Injectable, signal, inject } from '@angular/core';
import { WatchParty } from '../../../domain/model/watch-party.model';
import { WatchPartyService } from './watch-party.service';
import { WatchPartyWebSocketService } from './watch-party-websocket.service';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Shared state service for managing watch party across the application
 */
@Injectable({
  providedIn: 'root'
})
export class WatchPartyStateService {
  private watchPartyService = inject(WatchPartyService);
  private wsService = inject(WatchPartyWebSocketService);
  private authService = inject(AuthService);

  // Current active watch party
  activeParty = signal<WatchParty | null>(null);

  /**
   * Set the active watch party and connect to WebSocket
   */
  setActiveParty(party: WatchParty) {
    this.activeParty.set(party);
    this.wsService.connect(party.roomCode);
  }

  /**
   * Clear the active watch party and disconnect WebSocket
   */
  clearActiveParty() {
    this.wsService.disconnect();
    this.activeParty.set(null);
  }

  /**
   * Check if the current user is the creator of the active party
   */
  isCreator(): boolean {
    const party = this.activeParty();
    const currentUser = this.authService.currentUser();

    if (!party || !currentUser) {
      return false;
    }

    return party.creatorId === currentUser.id;
  }

  /**
   * Notify all party members when the creator selects a video
   * This is called when navigating to a video page
   */
  notifyVideoChange(videoPath: string) {
    const party = this.activeParty();

    if (!party) {
      console.log('No active watch party');
      return;
    }

    if (!this.isCreator()) {
      console.log('Not the party creator, skipping notification');
      return;
    }

    console.log('Party creator selecting video, notifying members:', videoPath);

    // Clean video path (remove extension if present)
    const cleanPath = videoPath.split('.')[0];

    // Update the current video in the backend using video path
    this.watchPartyService.updateCurrentVideoByPath(party.roomCode, cleanPath).subscribe({
      next: (updatedParty) => {
        console.log('Watch party updated with new video:', updatedParty);
        this.activeParty.set(updatedParty);

        // Send WebSocket message to all members
        this.wsService.sendVideoChange(party.roomCode, cleanPath);
      },
      error: (err) => {
        console.error('Failed to update watch party video:', err);
      }
    });
  }

  /**
   * Get the current active party
   */
  getActiveParty(): WatchParty | null {
    return this.activeParty();
  }
}
