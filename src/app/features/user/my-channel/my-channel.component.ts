import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-my-channel',
  standalone: true,
  imports: [],
  templateUrl: './my-channel.component.html',
  styleUrl: './my-channel.component.css'
})
export class MyChannelComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  user = this.auth.currentUser;

  navigateToNewVideo() {
    this.router.navigate(['/user/new-video']);
  }
}
