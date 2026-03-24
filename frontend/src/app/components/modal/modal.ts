import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-black/40 dark:bg-black/80 transition-opacity" aria-hidden="true" (click)="close.emit()"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="inline-block align-bottom bg-white dark:bg-gray-900 border-4 border-black dark:border-white rounded-none px-4 pt-5 pb-4 text-left overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              @if (title()) {
                <div class="mb-6 border-b-2 border-black dark:border-white pb-2">
                  <h3 class="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white" id="modal-title">{{ title() }}</h3>
                </div>
              }
              <div class="mt-2">
                <ng-content></ng-content>
              </div>
            </div>
            <div class="mt-8 flex justify-end space-x-4">
              <ng-content select="[footer]"></ng-content>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  isOpen = input<boolean>(false);
  title = input<string>('');
  close = output<void>();
}
