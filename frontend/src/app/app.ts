import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-600 uppercase tracking-wide">
          Exploratory Testing Dashboard
        </h1>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">v1.0.0</span>
        </div>
      </header>
      
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [],
})
export class App {
  protected readonly title = signal('frontend');
}
