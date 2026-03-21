import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" (click)="close.emit()"></div>

          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              @if (title()) {
                <div class="mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">{{ title() }}</h3>
                </div>
              }
              <div class="mt-2">
                <ng-content></ng-content>
              </div>
            </div>
            <div class="mt-5 sm:mt-6 flex justify-end space-x-3">
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
