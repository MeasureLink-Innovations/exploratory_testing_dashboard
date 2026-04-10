import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

let nextInputId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mb-4">
      @if (label()) {
        <label [for]="resolvedId()" class="block text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-1.5">{{ label() }}</label>
      }
      @if (type() === 'textarea') {
        <textarea
          [id]="resolvedId()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-600 sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          rows="3"
        ></textarea>
      } @else {
        <input
          [id]="resolvedId()"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-600 sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
      }
    </div>
  `,
})
export class InputComponent {
  private fallbackId = `app-input-${++nextInputId}`;

  id = input<string>('');
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  value = input<string>('');
  disabled = input<boolean>(false);
  valueChange = output<string>();

  resolvedId = computed(() => this.id() || this.fallbackId);

  onInput(event: any) {
    this.valueChange.emit(event.target.value);
  }
}
