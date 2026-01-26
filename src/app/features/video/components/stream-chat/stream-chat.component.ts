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

    messages = signal<{ sender: string, content: string }[]>([]);
    newMessage = '';
    isConnected = signal(false);
    error = signal<string | null>(null);

    ngOnInit() {
        this.connect();
    }

    connect() {
        if (!this.videoName) return;

        const rawToken = this.authService.getToken();
        if (!rawToken) {
            this.error.set('You must be logged in to chat.');
            this.isConnected.set(false);
            return;
        }

        let token = rawToken;
        if (token.startsWith('{')) {
            try {
                const parsed = JSON.parse(token);
                token = parsed.token || token;
            } catch (e) {
                // ignore
            }
        }
        const cleanToken = token.trim();

        const apiBase = environment.apiUrl;
        const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
        const wsHost = apiBase.replace(/^https?:\/\//, '').split('/api')[0];
        const wsUrl = `${wsProtocol}//${wsHost}/api/stream/${encodeURIComponent(this.videoName)}/chat?token=${encodeURIComponent(cleanToken)}`;

        console.log('Connecting to WebSocket:', wsUrl);

        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.isConnected.set(true);
                this.error.set(null);
                console.log('Connected to chat');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const messageObj = typeof data === 'string'
                        ? { sender: 'System', content: data }
                        : { sender: data.sender || 'User', content: data.content || JSON.stringify(data) };

                    this.messages.update(msgs => [...msgs, messageObj]);
                } catch (e) {
                    this.messages.update(msgs => [...msgs, { sender: 'Unknown', content: event.data }]);
                }
            };

            this.socket.onclose = (event) => {
                this.isConnected.set(false);
                console.log('Chat disconnected', event);
                if (!event.wasClean) {
                    this.error.set(`Connection lost.`);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error', error);
                this.error.set('WebSocket connection error.');
            };
        } catch (e: any) {
            console.error('Failed to create WebSocket', e);
            this.error.set(`Init error: ${e.message}`);
        }
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const payload = {
            content: this.newMessage
        };

        this.socket.send(JSON.stringify(payload));
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
