import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-channel',
  standalone: true,
  imports: [],
  templateUrl: './my-channel.component.html',
  styleUrl: './my-channel.component.css'
})
export class MyChannelComponent {
  private router = inject(Router);

  navigateToNewVideo() {
    this.router.navigate(['/my-channel/new-video']);
  }
}
