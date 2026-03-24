import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick.emit($event)"
      [class]="'px-4 py-2 font-bold uppercase tracking-tight transition-all focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed e-ink-button ' + variantClasses()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  variant = input<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  onClick = output<MouseEvent>();

  variantClasses() {
    switch (this.variant()) {
      case 'secondary': return 'bg-white dark:bg-gray-800 text-black dark:text-white';
      case 'danger': return 'bg-black dark:bg-red-900 text-white dark:text-red-100 border-red-600';
      case 'ghost': return 'bg-transparent text-gray-600 dark:text-gray-400 border-dashed hover:border-solid';
      default: return 'bg-black dark:bg-white text-white dark:text-black';
    }
  }
}
