import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

export interface VideoSyncMessage {
  type: 'VIDEO_CHANGE';
  roomCode: string;
  videoPath: string;
  userId: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class WatchPartyWebSocketService {
  private authService = inject(AuthService);
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<VideoSyncMessage>();
  private connectionSubject = new Subject<boolean>();

  messages$: Observable<VideoSyncMessage> = this.messageSubject.asObservable();
  connectionStatus$: Observable<boolean> = this.connectionSubject.asObservable();

  /**
   * Connect to the WebSocket server for a specific watch party room
   */
  connect(roomCode: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    let token = this.authService.getToken();
    if (!token) {
      console.error('No auth token available');
      return;
    }

    // Parse token if it's in JSON format {"token":"..."}
    try {
      const parsed = JSON.parse(token);
      if (parsed.token) {
        token = parsed.token;
      }
    } catch (e) {
      // Token is already a plain string, use as-is
    }

    // WebSocket URL - following the same pattern as chat WebSocket
    const apiBase = environment.apiUrl;  // 'http://localhost:8888/api'
    const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
    const wsHost = apiBase.replace(/^https?:\/\//, '').split('/api')[0];  // Extract 'localhost:8888'
    const wsUrl = `${wsProtocol}//${wsHost}/api/watchparty/${roomCode}/ws?token=${encodeURIComponent(token || "")}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`WebSocket connected to room: ${roomCode}`);
        this.connectionSubject.next(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: VideoSyncMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          this.messageSubject.next(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionSubject.next(false);
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionSubject.next(false);
        this.socket = null;
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.connectionSubject.next(false);
    }
  }

  /**
   * Send a video change message to all room members
   */
  sendVideoChange(roomCode: string, videoPath: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    const message: VideoSyncMessage = {
      type: 'VIDEO_CHANGE',
      roomCode,
      videoPath,
      userId: (this.authService.currentUser()?.id || 0).toString(),
      username: this.authService.currentUser()?.username || 'Unknown'
    };

    this.socket.send(JSON.stringify(message));
    console.log('Sent video change message:', message);
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}
