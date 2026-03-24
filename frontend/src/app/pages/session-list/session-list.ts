import { Component, OnInit, signal, inject, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { ModalComponent } from '../../components/modal/modal';
import { InputComponent } from '../../components/input/input';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ButtonComponent, 
    ModalComponent, 
    InputComponent
  ],
  template: `
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-4 border-black dark:border-white pb-6">
        <div>
          <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Session Archive</h2>
          <p class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mt-1">Exploratory Testing Manifest</p>
        </div>
        <div class="flex w-full sm:w-auto space-x-4">
           <app-input 
            placeholder="FILTER BY TITLE OR MACHINE..." 
            [value]="searchQuery()"
            (valueChange)="onSearch($event)"
            class="w-full sm:w-80 mb-0"
          />
          <app-button (onClick)="openCreateModal()">+ NEW ENTRY</app-button>
        </div>
      </div>

      <div class="overflow-x-auto e-ink-shadow">
        <table class="w-full border-collapse bg-white dark:bg-gray-900 border-2 border-black dark:border-white text-sm">
          <thead>
            <tr class="bg-black text-white dark:bg-white dark:text-black">
              <th (click)="toggleSort('title')" class="group cursor-pointer px-4 py-3 text-left text-xs font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                  <span>Session Title / Mission</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'title') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50 font-mono">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('machine_name')" class="group cursor-pointer px-4 py-3 text-left text-xs font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20 hidden md:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                  <span>Machine</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'machine_name') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50 font-mono">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('created_at')" class="group cursor-pointer px-4 py-3 text-left text-xs font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20 hidden sm:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                  <span>Created</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'created_at') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50 font-mono">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('status')" class="group cursor-pointer px-4 py-3 text-right text-xs font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-end">
                  <span>Status</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'status') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50 font-mono">↓</span> }
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y-2 divide-black dark:divide-white">
            @for (session of sessions(); track session.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <td class="px-4 py-4 border-r-2 border-black dark:border-white">
                  <div class="flex flex-col">
                    <span class="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:underline decoration-2 cursor-pointer" [routerLink]="['/sessions', session.id]">
                      {{ session.title }}
                    </span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1 font-medium">{{ session.mission }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap border-r-2 border-black dark:border-white hidden md:table-cell">
                  <span class="text-xs font-black font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1">
                    {{ session.machine_name || '---' }}
                  </span>
                </td>
                <td class="px-4 py-4 whitespace-nowrap hidden sm:table-cell border-r-2 border-black dark:border-white">
                  <div class="flex flex-col">
                    <span class="text-xs font-black font-mono text-gray-900 dark:text-white uppercase">{{ session.created_at | date:'MMM dd, yyyy' }}</span>
                    <span class="text-[10px] font-black font-mono text-gray-500 dark:text-gray-400 mt-0.5">{{ session.created_at | date:'shortTime' }}</span>
                  </div>
                </td>
                <td class="px-4 py-4 whitespace-nowrap text-right">
                  <span [class]="'px-2 py-1 text-[10px] font-black uppercase tracking-tighter border-2 inline-block ' + statusClasses(session.status)">
                    {{ session.status }}
                  </span>
                </td>
              </tr>
            }
 @empty {
              @if (!isLoading()) {
                <tr>
                  <td colspan="5" class="px-4 py-20 text-center">
                    <p class="text-lg font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest italic">No matching records found in manifest</p>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (hasMore()) {
        <div class="flex justify-center pt-4">
          <app-button variant="secondary" [disabled]="isLoading()" (onClick)="loadMore()">
            {{ isLoading() ? 'Loading...' : 'Load More' }}
          </app-button>
        </div>
      }

      <app-modal 
        [isOpen]="isModalOpen()" 
        title="Create New Session" 
        (close)="isModalOpen.set(false)"
      >
        <div class="space-y-4">
          <app-input 
            label="Title" 
            placeholder="e.g. Navigation Menu Audit" 
            [value]="newSession().title"
            (valueChange)="updateNewSession('title', $event)"
          />
          <app-input 
            label="Charter (What to test, Scope & Approach)" 
            type="textarea"
            placeholder="Define the scope, risks, and approach..." 
            [value]="newSession().charter"
            (valueChange)="updateNewSession('charter', $event)"
          />
          <app-input 
            label="Mission (Specific Goal/Target)" 
            type="textarea"
            placeholder="Define the specific goal or purpose of this session..." 
            [value]="newSession().mission"
            (valueChange)="updateNewSession('mission', $event)"
          />
          <div class="grid grid-cols-2 gap-4">
            <app-input 
              label="Machine Name (Optional)" 
              placeholder="e.g. Test-VM-01" 
              [value]="newSession().machine_name"
              (valueChange)="updateNewSession('machine_name', $event)"
            />
            <app-input 
              label="Timebox (Minutes)" 
              type="number"
              [value]="newSession().duration_minutes.toString()"
              (valueChange)="updateNewSession('duration_minutes', $event)"
            />
          </div>
        </div>
        <div footer>
          <app-button variant="secondary" (onClick)="isModalOpen.set(false)">Cancel</app-button>
          <app-button [disabled]="!isValid()" (onClick)="createSession()">Create</app-button>
        </div>
      </app-modal>
    </div>
  `,
})
export class SessionListComponent implements OnInit {
  private api = inject(ApiService);
  
  sessions = signal<any[]>([]);
  isModalOpen = signal(false);
  newSession = signal({ title: '', mission: '', charter: '', machine_name: '', duration_minutes: 60 });
  searchQuery = signal('');
  
  // Pagination & Sort state
  total = signal(0);
  limit = 12;
  offset = signal(0);
  sortBy = signal<string>('created_at');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');
  isLoading = signal(false);
  hasMore = signal(false);

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.resetAndLoad();
    });
  }

  ngOnInit() {
    this.loadSessions();
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  toggleSort(column: string) {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('DESC');
    }
    this.resetAndLoad();
  }

  resetAndLoad() {
    this.offset.set(0);
    this.sessions.set([]);
    this.loadSessions();
  }

  loadSessions() {
    this.isLoading.set(true);
    this.api.getSessions(
      this.searchQuery(), 
      this.limit, 
      this.offset(), 
      this.sortBy(), 
      this.sortOrder()
    ).subscribe(res => {
      const current = this.sessions();
      this.sessions.set([...current, ...res.sessions]);
      this.total.set(res.pagination.total);
      this.hasMore.set(this.sessions().length < res.pagination.total);
      this.isLoading.set(false);
    });
  }

  loadMore() {
    this.offset.update(o => o + this.limit);
    this.loadSessions();
  }

  openCreateModal() {
    this.newSession.set({ title: '', mission: '', charter: '', machine_name: '', duration_minutes: 60 });
    this.isModalOpen.set(true);
  }

  updateNewSession(field: string, value: string) {
    this.newSession.update(s => ({ 
      ...s, 
      [field]: field === 'duration_minutes' ? parseInt(value) || 0 : value 
    }));
  }

  isValid() {
    const s = this.newSession();
    return s.title && s.mission && s.charter;
  }

  createSession() {
    this.api.createSession(this.newSession()).subscribe(() => {
      this.isModalOpen.set(false);
      this.resetAndLoad();
    });
  }

  statusClasses(status: string) {
    switch (status) {
      case 'in-progress': return 'bg-black text-white dark:bg-white dark:text-black font-bold ring-1 ring-black';
      case 'debriefing': return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border border-gray-900';
      case 'completed': return 'bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-500 border border-gray-300 italic';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  }
}
