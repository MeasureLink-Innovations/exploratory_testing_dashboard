import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent, CardComponent],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
      <app-card class="w-full max-w-md">
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-black uppercase tracking-tighter text-black dark:text-white mb-2">
            System Login
          </h1>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Identity_Verification_Protocol
          </p>
        </div>

        <form (submit)="onSubmit($event)" class="space-y-4">
          <app-input
            label="Identifier (Email or Username)"
            placeholder="SYSTEM_ID_001"
            [value]="identifier()"
            (valueChange)="identifier.set($event)"
          />

          <app-input
            label="Access Key"
            type="password"
            placeholder="••••••••"
            [value]="password()"
            (valueChange)="password.set($event)"
          />

          @if (error()) {
            <div class="bg-red-500/10 border-l-4 border-red-500 p-3 mb-4">
              <p class="text-xs font-bold text-red-500 uppercase">{{ error() }}</p>
            </div>
          }

          <div class="pt-4 space-y-4">
            <app-button
              type="submit"
              class="w-full"
              [disabled]="isLoading()"
            >
              {{ isLoading() ? 'AUTHENTICATING...' : 'ESTABLISH_SESSION' }}
            </app-button>
          </div>
        </form>

        <div class="mt-8 pt-6 border-t border-black/5 flex justify-between items-center opacity-30">
          <span class="text-[8px] font-mono text-gray-400">AUTH_LEVEL: RESTRICTED</span>
          <span class="text-[8px] font-mono text-gray-400">ENCRYPTION: AES-256</span>
        </div>
      </app-card>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  identifier = signal('');
  password = signal('');
  error = signal('');
  isLoading = signal(false);

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.identifier() || !this.password()) {
      this.error.set('Credentials Required');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.authService.login({
      identifier: this.identifier(),
      password: this.password()
    }).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/sessions';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.error.set(err.error?.error || 'Authentication Failed');
        this.isLoading.set(false);
      }
    });
  }
}
