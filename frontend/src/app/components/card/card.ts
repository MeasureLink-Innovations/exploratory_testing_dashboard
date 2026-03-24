import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-gray-900 overflow-hidden e-ink-border e-ink-shadow h-full flex flex-col">
      @if (title()) {
        <div class="px-4 py-4 border-b-2 border-gray-900 dark:border-gray-100 sm:px-6 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-black uppercase tracking-tight text-gray-900 dark:text-white">{{ title() }}</h3>
          <div class="flex items-center space-x-2">
            <ng-content select="[header-actions]"></ng-content>
          </div>
        </div>
      }
      <div class="px-4 py-5 sm:p-6 flex-grow">
        <ng-content></ng-content>
      </div>
      <div class="mt-auto">
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
})
export class CardComponent {
  title = input<string>('');
}
