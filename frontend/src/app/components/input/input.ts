import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mb-4">
      @if (label()) {
        <label [for]="id()" class="block text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-1.5">{{ label() }}</label>
      }
      @if (type() === 'textarea') {
        <textarea
          [id]="id()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-600 sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          rows="3"
        ></textarea>
      } @else {
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="disabled()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white dark:placeholder-gray-600 sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
        />
      }
    </div>
  `,
})
export class InputComponent {
  id = input<string>('');
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  value = input<string>('');
  disabled = input<boolean>(false);
  valueChange = output<string>();

  onInput(event: any) {
    this.valueChange.emit(event.target.value);
  }
}
