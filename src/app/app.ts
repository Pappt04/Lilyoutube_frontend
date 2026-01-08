import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ProfileSectionComponent } from './features/user/profile-section/profile-section.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ProfileSectionComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private auth = inject(AuthService);
  isProfileOpen = false;

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.auth.refreshUser().subscribe({
        error: () => this.auth.logout()
      });
    }
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }
}
