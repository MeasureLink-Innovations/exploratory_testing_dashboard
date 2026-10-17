import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      (click)="onClick.emit($event)"
      [class]="'font-bold uppercase tracking-tight transition-all focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-border disabled:opacity-30 disabled:cursor-not-allowed e-ink-button ' + sizeClasses() + ' ' + variantClasses()"
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

  sizeClasses() {
    switch (this.size()) {
      case 'sm': return 'px-3 py-2 text-[10px] min-h-10';
      case 'lg': return 'px-5 py-3 text-sm min-h-12';
      default: return 'px-4 py-2 text-xs min-h-11';
    }
  }

  variantClasses() {
    switch (this.variant()) {
      case 'secondary': return 'bg-paper-surface text-ink-primary';
      case 'danger': return 'bg-ink-primary dark:bg-red-900 text-paper-bg dark:text-red-100 border-red-600';
      case 'ghost': return 'bg-transparent text-gray-600 dark:text-gray-400 border-dashed hover:border-solid';
      default: return 'bg-ink-primary text-paper-bg';
    }
  }
}
