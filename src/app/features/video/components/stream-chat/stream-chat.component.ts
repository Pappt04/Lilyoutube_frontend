import { Component, Input, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-stream-chat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stream-chat.component.html',
    styleUrl: './stream-chat.component.css'
})
export class StreamChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    @Input() videoName!: string;
    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    private authService = inject(AuthService);
    private socket: WebSocket | null = null;

    messages = signal<string[]>([]);
    newMessage = '';
    isConnected = signal(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.connect();
    }

    connect() {
        if (!this.videoName) return;

        const token = this.authService.getToken();
        if (!token) {
            this.error.set('You must be logged in to chat.');
            this.isConnected.set(false);
            return;
        }

        // e.g., 'http://localhost:8888/api' -> 'ws://localhost:8888/stream/video/chat'
        const apiBase = environment.apiUrl//.replace('/api', '');
        const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
        const wsHost = apiBase.replace(/^https?:\/\//, '');
        const wsUrl = `${wsProtocol}//${wsHost}/stream/${this.videoName}/chat`;

        console.log('Connecting to WebSocket:', wsUrl);
        this.socket = new WebSocket(wsUrl, [token]);

        this.socket.onopen = () => {
            this.isConnected.set(true);
            this.error.set(null);
            console.log('Connected to chat');
        };

        this.socket.onmessage = (event) => {
            const message = event.data;
            this.messages.update(msgs => [...msgs, message]);
        };

        this.socket.onclose = (event) => {
            this.isConnected.set(false);
            console.log('Chat disconnected', event);
            if (!event.wasClean) {
                this.error.set(`Connection lost (${event.code}). Retrying...`);
                // Optional: Add simple retry logic
                setTimeout(() => this.connect(), 5000);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error', error);
            this.error.set('Connection error.');
        };
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        this.socket.send(this.newMessage);
        this.newMessage = '';
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    ngOnDestroy() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
