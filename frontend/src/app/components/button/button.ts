import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick.emit($event)"
      [class]="'px-4 py-2 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ' + variantClasses()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  onClick = output<MouseEvent>();

  variantClasses() {
    switch (this.variant()) {
      case 'secondary': return 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500';
      case 'danger': return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'ghost': return 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-400';
      default: return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  }
}
