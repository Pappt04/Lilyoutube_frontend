import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ProfileSectionComponent } from './features/user/profile-section/profile-section.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ProfileSectionComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isProfileOpen = false;

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
  }
}
