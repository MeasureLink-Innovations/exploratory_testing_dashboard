import { Component, OnInit, signal, inject, EffectRef, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { ModalComponent } from '../../components/modal/modal';
import { InputComponent } from '../../components/input/input';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';

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
      <div class="flex flex-col lg:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6">
        <div class="flex-grow">
          <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Session Archive</h2>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-2">Exploratory Testing Manifest</p>
        </div>
        
        <div class="flex flex-wrap items-end gap-4 w-full lg:w-auto">
          <!-- Version Picker -->
          <div class="flex flex-col min-w-[120px]">
            <label class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Filter Version</label>
            <select 
              [value]="selectedVersion() || ''"
              (change)="onVersionChange($any($event.target).value)"
              class="bg-white dark:bg-gray-900 border-2 border-black dark:border-white px-2 h-9 text-[10px] font-black uppercase focus:outline-none"
            >
              <option value="">All Versions</option>
              @for (v of availableVersions(); track v) {
                <option [value]="v">{{ v }}</option>
              }
            </select>
          </div>

           <app-input 
            placeholder="Search title, machine..." 
            [value]="searchQuery()"
            (valueChange)="onSearch($event)"
            class="!mb-0 w-full sm:w-60 h-9"
          />
          <app-button class="h-9 whitespace-nowrap" (onClick)="openCreateModal()">+ New Manifest</app-button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse bg-white dark:bg-gray-900 border-2 border-black dark:border-white text-sm">
          <thead>
            <tr class="bg-black text-white dark:bg-white dark:text-black divide-x divide-white/20 dark:divide-black/20">
              <th (click)="toggleSort('title')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                <div class="flex items-center justify-between">
                  <span>Session Goal</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'title') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('software_version')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-32">
                <div class="flex items-center justify-between">
                  <span>Version</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'software_version') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('machine_name')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-32">
                <div class="flex items-center justify-between">
                  <span>Machine</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'machine_name') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('created_at')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden sm:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-40">
                <div class="flex items-center justify-between">
                  <span>Created</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'created_at') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50">↓</span> }
                  </span>
                </div>
              </th>
              <th (click)="toggleSort('status')" class="group cursor-pointer px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-28">
                <div class="flex items-center justify-end">
                  <span>Status</span>
                  <span class="ml-2 font-mono">
                    @if (sortBy() === 'status') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                    @else { <span class="opacity-0 group-hover:opacity-50">↓</span> }
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/10 dark:divide-white/10">
            @for (session of sessions(); track session.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group divide-x divide-black/10 dark:divide-white/10 leading-tight">
                <td class="px-4 py-2">
                  <div class="flex flex-col">
                    <span class="text-xs font-black text-gray-900 dark:text-white group-hover:underline decoration-black dark:decoration-white decoration-2 cursor-pointer uppercase tracking-tight" [routerLink]="['/sessions', session.id]">
                      {{ session.title }}
                    </span>
                    <span class="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-bold uppercase">{{ session.charter }}</span>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell">
                  <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black font-mono text-black dark:text-white bg-black/5 dark:bg-white/10 px-1.5 py-0.5 border border-black/10">
                      {{ session.software_version || '---' }}
                    </span>
                    @if (session.software_version && session.software_version === currentLatestVersion()) {
                      <span class="text-[8px] font-black uppercase tracking-tighter bg-black text-white dark:bg-white dark:text-black px-1 py-0.5">Latest</span>
                    }
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell">
                  <span class="text-[9px] font-black font-mono text-gray-500 dark:text-gray-400 uppercase">
                    {{ session.machine_name || '---' }}
                  </span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap hidden sm:table-cell">
                  <div class="flex flex-col">
                    <span class="text-[10px] font-black font-mono text-gray-900 dark:text-white">{{ session.created_at | date:'yyyy-MM-dd' }}</span>
                    <span class="text-[9px] font-bold font-mono text-gray-400 dark:text-gray-500">{{ session.created_at | date:'HH:mm' }}</span>
                  </div>
                </td>
                <td class="px-4 py-2 whitespace-nowrap text-right">
                  <span [class]="'px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter border-2 inline-block ' + statusClasses(session.status)">
                    {{ session.status }}
                  </span>
                </td>
              </tr>
            } @empty {
              @if (!isLoading()) {
                <tr>
                  <td colspan="5" class="px-4 py-24 text-center bg-gray-50/50 dark:bg-gray-800/20 border-t-2 border-black">
                    <div class="max-w-md mx-auto space-y-4">
                      <div class="space-y-1">
                        <h3 class="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">Manifest Empty</h3>
                        <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
                          No sessions match the active filters.
                        </p>
                      </div>
                      <app-button size="sm" (onClick)="openCreateModal()">+ Initialize New Session</app-button>
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      @if (hasMore()) {
        <div class="flex justify-center pt-2">
          <app-button variant="secondary" size="sm" [disabled]="isLoading()" (onClick)="loadMore()">
            {{ isLoading() ? 'Loading...' : 'Fetch More Data' }}
          </app-button>
        </div>
      }

      <app-modal 
        [isOpen]="isModalOpen()" 
        title="Initialize New Session" 
        (close)="isModalOpen.set(false)"
      >
        <div class="space-y-4">
          <!-- Metadata Reuse Section - Refined hierarchy -->
          <div class="p-3 border-2 border-black dark:border-white space-y-3">
            <div class="flex justify-between items-center border-b border-black/10 pb-1.5">
              <label class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Template Protocol</label>
              @if (selectedTemplate()) {
                <button (click)="clearTemplate()" class="text-[9px] font-black text-red-500 hover:underline uppercase">Abort Reuse</button>
              }
            </div>
            
            @if (!selectedTemplate()) {
              <app-input 
                placeholder="Search historical manifest..." 
                [value]="templateSearchQuery()"
                (valueChange)="onTemplateSearch($event)"
                class="!mb-0 !text-[10px]"
              />
              @if (historicalSessions().length > 0) {
                <div class="border-t border-black/10 divide-y divide-black/10 max-h-32 overflow-y-auto">
                  @for (hist of historicalSessions(); track hist.id) {
                    <div 
                      (click)="applyTemplate(hist)"
                      class="px-2 py-1.5 text-[10px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer flex justify-between items-center group font-black uppercase tracking-tight"
                    >
                      <span class="truncate">{{ hist.title }}</span>
                      <span class="text-[8px] font-mono opacity-50">{{ hist.software_version || 'v?' }}</span>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="flex items-center justify-between bg-black text-white dark:bg-white dark:text-black px-2 py-1.5 text-[10px] font-black uppercase">
                <span class="truncate">Active: {{ selectedTemplate().title }}</span>
                <span class="text-[8px] font-mono opacity-70">LOCKED</span>
              </div>
            }
          </div>

          <app-input 
            label="Session Identifier" 
            placeholder="e.g. Navigation Audit" 
            [value]="newSession().title"
            (valueChange)="updateNewSession('title', $event)"
          />
          <div class="space-y-1">
            <app-input 
              label="Mission Charter" 
              type="textarea"
              placeholder="Define goal and approach parameters..." 
              [value]="newSession().charter"
              (valueChange)="updateNewSession('charter', $event)"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-input 
              label="Target Unit" 
              placeholder="e.g. Test-VM-01" 
              [value]="newSession().machine_name"
              (valueChange)="updateNewSession('machine_name', $event)"
            />
            <div class="space-y-1">
              <app-input 
                label="SW Version" 
                placeholder="e.g. v1.2.3" 
                [value]="newSession().software_version"
                (valueChange)="updateNewSession('software_version', $event)"
                class="!mb-0"
              />
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-tighter px-1">Pattern: vX.Y.Z</p>
            </div>
          </div>
          <app-input 
            label="Timebox (Min)" 
            type="number"
            [value]="newSession().duration_minutes.toString()"
            (valueChange)="updateNewSession('duration_minutes', $event)"
          />
        </div>
        <div footer>
          <app-button variant="secondary" (onClick)="isModalOpen.set(false)">Abort</app-button>
          <app-button [disabled]="!isValid()" (onClick)="createSession()">Execute</app-button>
        </div>
      </app-modal>
    </div>
  `,
})
export class SessionListComponent implements OnInit {
  private api = inject(ApiService);
  
  sessions = signal<any[]>([]);
  isModalOpen = signal(false);
  newSession = signal({ title: '', mission: '-', charter: '', machine_name: '', software_version: '', duration_minutes: 60 });
  searchQuery = signal('');
  
  // Version Filtering state
  selectedVersion = signal<string | null>(localStorage.getItem('selected_version'));
  availableVersions = signal<string[]>([]);
  
  // Metadata reuse state
  templateSearchQuery = signal('');
  historicalSessions = signal<any[]>([]);
  selectedTemplate = signal<any | null>(null);

  // Pagination & Sort state
  total = signal(0);
  limit = 12;
  offset = signal(0);
  sortBy = signal<string>('created_at');
  sortOrder = signal<'ASC' | 'DESC'>('DESC');
  isLoading = signal(false);
  hasMore = signal(false);

  currentLatestVersion = computed(() => {
    if (this.availableVersions().length === 0) return null;
    return this.availableVersions()[0];
  });

  private searchSubject = new Subject<string>();
  private templateSearchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.resetAndLoad();
    });

    this.templateSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query) return of({ sessions: [] });
        return this.api.getSessions(query, 5);
      })
    ).subscribe(res => {
      this.historicalSessions.set(res.sessions);
    });
  }

  ngOnInit() {
    this.loadVersions();
    this.loadSessions();
  }

  loadVersions() {
    this.api.getVersions().subscribe(versions => {
      this.availableVersions.set(versions);
      
      // Validate stored version
      const stored = this.selectedVersion();
      if (stored && !versions.includes(stored)) {
        this.onVersionChange(''); // Reset if version no longer exists
      }
    });
  }

  onVersionChange(version: string) {
    const val = version || null;
    this.selectedVersion.set(val);
    if (val) {
      localStorage.setItem('selected_version', val);
    } else {
      localStorage.removeItem('selected_version');
    }
    this.resetAndLoad();
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  onTemplateSearch(query: string) {
    this.templateSearchQuery.set(query);
    this.templateSearchSubject.next(query);
  }

  applyTemplate(session: any) {
    this.selectedTemplate.set(session);
    this.updateNewSession('title', session.title);
    this.updateNewSession('charter', session.charter);
    this.historicalSessions.set([]);
    this.templateSearchQuery.set('');
  }

  clearTemplate() {
    this.selectedTemplate.set(null);
    this.updateNewSession('title', '');
    this.updateNewSession('charter', '');
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
      this.sortOrder(),
      this.selectedVersion() || undefined
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
    this.newSession.set({ title: '', mission: '-', charter: '', machine_name: '', software_version: '', duration_minutes: 60 });
    this.selectedTemplate.set(null);
    this.templateSearchQuery.set('');
    this.historicalSessions.set([]);
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
    return s.title && s.charter;
  }

  createSession() {
    this.api.createSession(this.newSession()).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadVersions(); // Refresh versions list in case new one was added
        this.resetAndLoad();
      },
      error: (err) => {
        alert(err.error?.error || 'Failed to create session');
      }
    });
  }

  statusClasses(status: string) {
    switch (status) {
      case 'in-progress': return 'bg-black text-white dark:bg-white dark:text-black font-black ring-1 ring-black';
      case 'debriefing': return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 border border-black dark:border-white';
      case 'completed': return 'bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-500 border border-gray-300 italic';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  }
}
