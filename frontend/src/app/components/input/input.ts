import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="mb-4">
      @if (label()) {
        <label [for]="id()" class="block text-sm font-medium text-gray-700 mb-1">{{ label() }}</label>
      }
      @if (type() === 'textarea') {
        <textarea
          [id]="id()"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows="3"
        ></textarea>
      } @else {
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="onInput($event)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
  valueChange = output<string>();

  onInput(event: any) {
    this.valueChange.emit(event.target.value);
  }
}
