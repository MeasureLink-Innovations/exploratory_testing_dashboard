import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      @if (title()) {
        <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ title() }}</h3>
        </div>
      }
      <div class="px-4 py-5 sm:p-6">
        <ng-content></ng-content>
      </div>
      <ng-content select="[footer]"></ng-content>
    </div>
  `,
})
export class CardComponent {
  title = input<string>('');
}
