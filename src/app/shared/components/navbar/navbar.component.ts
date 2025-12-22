import {Component, inject, output} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [
    NgOptimizedImage
  ],
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    private router = inject(Router);
    openProfile = output<void>();

    onProfileClick() {
        this.openProfile.emit();
    }

    onNavbarClick() {
      this.router.navigate(['']);
    }
}
