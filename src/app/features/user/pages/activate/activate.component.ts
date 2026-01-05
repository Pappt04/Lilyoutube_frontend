import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activate.component.html',
  styleUrl: './activate.component.css'
})
export class ActivateComponent {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);

  loading = true;
  message = '';
  error = '';

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.error = 'Nedostaje token u URL-u.';
      this.loading = false;
      return;
    }

    this.auth.activate(token).subscribe({
      next: (res) => {
        this.message = res || 'Nalog je uspešno aktiviran.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Aktivacija nije uspela.';
        this.loading = false;
      }
    });
  }
}
