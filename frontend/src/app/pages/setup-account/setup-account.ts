import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';

@Component({
  selector: 'app-setup-account',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
      <app-card class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
            Account Setup
          </h1>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
            Personalize your operator credentials to complete system entry.
          </p>
        </div>

        <form (submit)="onSubmit($event)" class="space-y-4">
          <app-input
            label="Operator Username"
            placeholder="e.g. j_doe"
            [value]="username()"
            (valueChange)="username.set($event)"
          />

          <app-input
            label="Internal Email"
            type="email"
            placeholder="operator@system.internal"
            [value]="email()"
            (valueChange)="email.set($event)"
          />

          <div class="pt-2 border-t border-black/5">
            <app-input
              label="New Access Key"
              type="password"
              placeholder="••••••••"
              [value]="password()"
              (valueChange)="password.set($event)"
            />

            <app-input
              label="Confirm Access Key"
              type="password"
              placeholder="••••••••"
              [value]="confirmPassword()"
              (valueChange)="confirmPassword.set($event)"
            />
          </div>

          @if (error()) {
            <div class="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4">
              <p class="text-xs font-bold text-red-500 uppercase">{{ error() }}</p>
            </div>
          }

          <div class="pt-4">
            <app-button
              type="submit"
              class="w-full"
              [disabled]="isLoading()"
            >
              {{ isLoading() ? 'SYNCHRONIZING...' : 'FINALIZE_SETUP' }}
            </app-button>
          </div>
        </form>

        <div class="mt-8 pt-6 border-t border-black/5 flex justify-between items-center opacity-30">
          <span class="text-[8px] font-mono text-gray-400">STATE: PENDING_INITIALIZATION</span>
          <span class="text-[8px] font-mono text-gray-400">SECURITY: FORCED_RESET</span>
        </div>
      </app-card>
    </div>
  `,
})
export class AccountSetupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal(this.authService.currentUser()?.username || '');
  email = signal(this.authService.currentUser()?.email || '');
  password = signal('');
  confirmPassword = signal('');
  error = signal('');
  isLoading = signal(false);

  onSubmit(event: Event) {
    event.preventDefault();
    
    if (!this.username() || !this.email() || !this.password()) {
      this.error.set('All fields are mandatory');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Keys do not match');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.setupAccount({
      username: this.username(),
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.router.navigate(['/sessions']);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Setup Failed');
        this.isLoading.set(false);
      }
    });
  }
}
