import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService, Theme } from './services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div class="min-h-screen paper-bg text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
      <header class="bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-black text-black dark:text-white uppercase tracking-tighter leading-none">
            Exploratory Dashboard
          </h1>
          <span class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-600 hidden sm:inline tracking-widest border-l border-black/10 dark:border-white/10 pl-4">v1.0.0</span>
        </div>

        <div class="flex items-center gap-6">
          <!-- Instrument-style Theme Slider -->
          <div class="flex items-center gap-3">
            <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">Mode</span>
            <div class="relative w-24 h-6 bg-gray-100 dark:bg-black border border-black dark:border-white p-0.5 flex">
              <div 
                class="absolute top-0.5 bottom-0.5 w-[calc(33.33%-1px)] bg-black dark:bg-white transition-all duration-300 ease-out z-0"
                [style.transform]="getSliderPosition()"
              ></div>
              <button (click)="themeService.setTheme('light')" class="relative z-10 flex-1 text-[8px] font-black uppercase text-center transition-colors" [class.text-white]="themeService.theme() === 'light'" [class.dark:text-black]="themeService.theme() === 'light'">Light</button>
              <button (click)="themeService.setTheme('dark')" class="relative z-10 flex-1 text-[8px] font-black uppercase text-center transition-colors" [class.text-white]="themeService.theme() === 'dark'" [class.dark:text-black]="themeService.theme() === 'dark'">Dark</button>
              <button (click)="themeService.setTheme('system')" class="relative z-10 flex-1 text-[8px] font-black uppercase text-center transition-colors" [class.text-white]="themeService.theme() === 'system'" [class.dark:text-black]="themeService.theme() === 'system'">Auto</button>
            </div>
          </div>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('frontend');
  public themeService = inject(ThemeService);

  getSliderPosition() {
    switch(this.themeService.theme()) {
      case 'light': return 'translateX(0)';
      case 'dark': return 'translateX(100%)';
      case 'system': return 'translateX(200%)';
      default: return 'translateX(0)';
    }
  }
}
