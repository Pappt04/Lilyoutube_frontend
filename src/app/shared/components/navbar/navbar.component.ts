import { Component, inject, output, PLATFORM_ID } from '@angular/core';
import { NgIf, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
  imports: [NgOptimizedImage, NgIf]
})
export class NavbarComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  user = this.auth.currentUser;
  openProfile = output<void>();

  isBrowser = isPlatformBrowser(this.platformId);

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  onProfileClick() {
    this.openProfile.emit();
  }

  onNavbarClick() {
    this.router.navigate(['']);
  }

  goToLogin() {
    this.router.navigate(['/user/login']);
  }

  goToRegister() {
    this.router.navigate(['/user/register']);
  }

  onLogoutClick() {
    this.auth.logout();
    this.router.navigate(['']);
  }
}
