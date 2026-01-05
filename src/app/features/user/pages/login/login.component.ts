import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../../../core/auth/auth.service';
import { LoginRequest } from '../../../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMsg = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.errorMsg = '';

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.errorMsg = 'Unesi ispravan email i lozinku.';
      this.cdr.detectChanges();
      return;
    }

    const payload: LoginRequest = this.form.getRawValue() as LoginRequest;

    this.loading = true;
    this.cdr.detectChanges();

    this.auth
      .login(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.errorMsg = '';
          this.cdr.detectChanges();
          this.router.navigate(['/']);
        },
        error: (e) => {
          const status = e?.status;

          if (status === 401) {
            this.errorMsg = 'Pogrešan email ili lozinka.';
          } else if (status === 403) {
            this.errorMsg = 'Nalog nije aktiviran ili nemaš dozvolu.';
          } else {
            this.errorMsg =
              e?.error?.message ??
              (typeof e?.error === 'string' ? e.error : null) ??
              e?.message ??
              'Greška pri login-u.';
          }

          this.cdr.detectChanges();
        },
      });
  }
}
