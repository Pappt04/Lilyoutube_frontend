import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

import { AuthService } from '../../../../core/auth/auth.service';
import { RegisterRequest } from '../../../../core/auth/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  message = '';
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    address: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  submit(): void {
    this.message = '';
    this.error = '';

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error = 'Popuni sva obavezna polja ispravno.';
      this.cdr.detectChanges();
      return;
    }

    const raw = this.form.getRawValue();
    const password = raw.password ?? '';
    const confirmPassword = raw.confirmPassword ?? '';

    if (password !== confirmPassword) {
      this.error = 'Lozinke se ne poklapaju.';
      this.cdr.detectChanges();
      return;
    }

    const payload: RegisterRequest = {
      email: raw.email ?? '',
      username: raw.username ?? '',
      firstName: raw.firstName ?? '',
      lastName: raw.lastName ?? '',
      address: raw.address ?? '',
      password,
      confirmPassword,
    };

    this.loading = true;
    this.cdr.detectChanges();

    this.auth
      .register(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (txt) => {
          // backend često vraća plain text
          this.message = (typeof txt === 'string' ? txt : 'Registracija uspešna!');
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (e) => {
          const msg =
            e?.error?.message ??
            (typeof e?.error === 'string' ? e.error : null) ??
            e?.message ??
            'Registracija nije uspela.';

          this.error = msg;
          this.message = '';
          this.cdr.detectChanges();
        },
      });
  }
}
