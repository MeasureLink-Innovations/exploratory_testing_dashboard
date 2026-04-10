import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { InputComponent } from '../../components/input/input';
import { ButtonComponent } from '../../components/button/button';

@Component({
  selector: 'app-versions',
  standalone: true,
  imports: [CommonModule, InputComponent, ButtonComponent],
  template: `
    <div class="h-full flex flex-col overflow-hidden px-2 sm:px-6 py-6 animate-in fade-in duration-700 ease-out">
      <div class="flex-shrink-0 border-b-2 border-black dark:border-white pb-6 mb-6">
        <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Version Catalog</h2>
        <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-2">Manage selectable software versions</p>
      </div>

      <div class="flex-shrink-0 border-2 border-black dark:border-white p-4 mb-6 bg-white dark:bg-gray-900">
        <p class="text-[10px] font-bold text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
          Removing a version only affects future selection. Existing sessions keep their stored version tag.
        </p>

        <app-input
          label="Add version"
          placeholder="v1.2.3"
          [value]="newVersion()"
          [disabled]="isSubmitting()"
          (valueChange)="newVersion.set($event)"
        />

        @if (errorMessage()) {
          <p role="alert" class="text-[10px] font-bold text-red-700 dark:text-red-300 mt-2 leading-relaxed">{{ errorMessage() }}</p>
        }

        @if (successMessage()) {
          <p aria-live="polite" class="text-[10px] font-bold text-green-700 dark:text-green-300 mt-2 leading-relaxed">{{ successMessage() }}</p>
        }

        @if (loadError()) {
          <div role="alert" class="mt-3 border border-red-600 px-3 py-2 bg-red-50 dark:bg-red-900/20">
            <p class="text-[10px] font-bold text-red-700 dark:text-red-300">{{ loadError() }}</p>
            <div class="mt-2">
              <app-button size="sm" variant="secondary" (onClick)="loadVersions()">Retry</app-button>
            </div>
          </div>
        }

        <div class="flex justify-end mt-3">
          <app-button [disabled]="isSubmitting() || !newVersion().trim()" (onClick)="createVersion()">
            {{ isSubmitting() ? 'Saving...' : 'Add Version' }}
          </app-button>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto custom-scrollbar border-2 border-black dark:border-white bg-white dark:bg-gray-900">
        <table class="w-full border-collapse text-sm">
          <thead class="sticky top-0 z-20">
            <tr class="bg-black text-white dark:bg-white dark:text-black">
              <th class="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Version</th>
              <th class="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Created</th>
              <th class="px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/10 dark:divide-white/10">
            @for (item of versions(); track item.id) {
              <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td class="px-4 py-3 font-mono font-bold truncate max-w-[260px]" [title]="item.version">{{ item.version }}</td>
                <td class="px-4 py-3 text-[10px] font-mono text-gray-500 dark:text-gray-400">{{ item.created_at | date:'yyyy-MM-dd HH:mm' }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    (click)="removeVersion(item.id, item.version)"
                    [disabled]="isSubmitting() || removingId() === item.id"
                    title="Removes from selectable list only. Existing sessions keep this version tag."
                    aria-label="Remove version from selectable list only"
                    class="px-3 py-2 min-h-11 border border-black dark:border-white text-[10px] font-black uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ removingId() === item.id ? 'Removing...' : 'Remove' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="3" class="px-4 py-16 text-center text-[10px] font-black uppercase text-gray-400">No selectable versions yet</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class VersionsComponent implements OnInit {
  private api = inject(ApiService);

  versions = signal<any[]>([]);
  newVersion = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  loadError = signal('');
  isSubmitting = signal(false);
  removingId = signal<number | null>(null);

  ngOnInit() {
    this.loadVersions();
  }

  loadVersions() {
    this.loadError.set('');
    this.api.getVersionCatalog().subscribe({
      next: (rows) => this.versions.set(rows),
      error: (err) => {
        this.loadError.set(err.error?.error || 'Failed to load version catalog. Check your connection and try again.');
      }
    });
  }

  createVersion() {
    const version = this.newVersion().trim();
    if (!version) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.api.createVersion(version).subscribe({
      next: () => {
        this.newVersion.set('');
        this.isSubmitting.set(false);
        this.successMessage.set('Version added to selectable catalog.');
        this.loadVersions();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to add version. Please try again.');
      }
    });
  }

  removeVersion(id: number, version: string) {
    this.errorMessage.set('');
    this.successMessage.set('');

    const confirmed = window.confirm(
      `Remove "${version}" from selectable versions? Existing sessions will keep their stored version tag.`
    );
    if (!confirmed) return;

    this.removingId.set(id);
    this.api.deleteVersion(id).subscribe({
      next: () => {
        this.removingId.set(null);
        this.successMessage.set('Version removed from selectable catalog.');
        this.loadVersions();
      },
      error: (err) => {
        this.removingId.set(null);
        this.errorMessage.set(err.error?.error || 'Failed to remove version. Please try again.');
      }
    });
  }
}
