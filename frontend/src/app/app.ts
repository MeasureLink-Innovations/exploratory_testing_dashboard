import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="h-screen paper-bg text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 flex flex-col overflow-hidden">
      <header class="bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white px-6 py-3 flex items-center justify-between flex-shrink-0 relative z-50">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-black text-black dark:text-white uppercase tracking-tighter leading-none cursor-pointer" routerLink="/">
            Exploratory Dashboard
          </h1>
          <span class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-600 hidden sm:inline tracking-widest border-l border-black/10 dark:border-white/10 pl-4">v1.0.0</span>
          
          @if (authService.isAdmin() && !authService.mustChangePassword()) {
            <a routerLink="/admin" class="ml-4 px-2 py-1 text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white">System_Admin</a>
            <a routerLink="/versions" class="px-2 py-1 text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white">Versions</a>
          }
        </div>

        <div class="flex items-center gap-6">
          <!-- User Session Info -->
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-3 pr-6 border-r border-black/10 dark:border-white/10 hidden md:flex">
              <div class="flex flex-col items-end">
                <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Authenticated_Operator</span>
                <span class="text-[10px] font-black uppercase text-black dark:text-white leading-none">{{ authService.currentUser()?.username }}</span>
              </div>
              <button (click)="logout()" class="px-3 py-2 min-h-10 border border-black dark:border-white text-[10px] font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white">Disconnect</button>
            </div>
          }

          <!-- Instrument-style Theme Slider -->
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">Mode</span>
            <div class="relative w-30 h-8 bg-gray-100 dark:bg-black border border-black dark:border-white p-0.5 flex">
              <div 
                class="absolute top-0.5 bottom-0.5 w-[calc(33.33%-1px)] bg-black dark:bg-white transition-all duration-300 ease-out z-0"
                [style.transform]="getSliderPosition()"
              ></div>
              <button (click)="themeService.setTheme('light')" class="relative z-10 flex-1 text-[10px] font-black uppercase text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black dark:focus-visible:outline-white" [class.text-white]="themeService.theme() === 'light'" [class.dark:text-black]="themeService.theme() === 'light'">Light</button>
              <button (click)="themeService.setTheme('dark')" class="relative z-10 flex-1 text-[10px] font-black uppercase text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black dark:focus-visible:outline-white" [class.text-white]="themeService.theme() === 'dark'" [class.dark:text-black]="themeService.theme() === 'dark'">Dark</button>
              <button (click)="themeService.setTheme('system')" class="relative z-10 flex-1 text-[10px] font-black uppercase text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black dark:focus-visible:outline-white" [class.text-white]="themeService.theme() === 'system'" [class.dark:text-black]="themeService.theme() === 'system'">Auto</button>
            </div>
          </div>
        </div>
      </header>
      
      <main class="flex-grow relative z-10 overflow-hidden flex flex-col">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('frontend');
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);
  private router = inject(Router);

  getSliderPosition() {
    switch(this.themeService.theme()) {
      case 'light': return 'translateX(0)';
      case 'dark': return 'translateX(100%)';
      case 'system': return 'translateX(200%)';
      default: return 'translateX(0)';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
