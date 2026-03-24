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
      <header class="bg-white dark:bg-gray-900 border-b-2 border-gray-900 dark:border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <h1 class="text-xl font-black text-black dark:text-white uppercase tracking-tighter">
          Exploratory Dashboard
        </h1>
        <div class="flex items-center space-x-4">
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-900 dark:border-gray-700">
            <button 
              (click)="themeService.setTheme('light')"
              [class]="'px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (themeService.theme() === 'light' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')"
            >
              Light
            </button>
            <button 
              (click)="themeService.setTheme('dark')"
              [class]="'px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (themeService.theme() === 'dark' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')"
            >
              Dark
            </button>
            <button 
              (click)="themeService.setTheme('system')"
              [class]="'px-3 py-1.5 rounded-lg text-xs font-bold transition-all ' + (themeService.theme() === 'system' ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg scale-105' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300')"
            >
              Auto
            </button>
          </div>
          <span class="text-[10px] font-black uppercase text-gray-400 dark:text-gray-600 hidden sm:inline tracking-widest border-l border-gray-300 dark:border-gray-700 pl-4">v1.0.0</span>
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
}
