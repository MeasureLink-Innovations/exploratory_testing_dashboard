import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
    <div class="h-full flex flex-col overflow-hidden px-2 sm:px-6 py-6 animate-in fade-in duration-700 ease-out">
      <div class="flex-shrink-0 flex flex-col lg:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6 mb-8">
        <div class="flex-grow">
          <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Session Archive</h2>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-2">Track and review exploratory test sessions</p>
        </div>
        
        <div class="flex flex-wrap items-end gap-4 w-full lg:w-auto">
          <!-- Version Picker -->
          <div class="flex flex-col min-w-[120px]">
            <label class="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Filter Version</label>
            <select 
              [value]="selectedVersion() || ''"
              (change)="onVersionChange($any($event.target).value)"
              class="bg-white dark:bg-gray-900 border-2 border-black dark:border-white px-2 h-11 text-[10px] font-black uppercase focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
          <app-button class="h-9 whitespace-nowrap active:scale-95 transition-transform" (onClick)="openCreateModal()">+ New Manifest</app-button>
        </div>
      </div>

      @if (listError()) {
        <div class="mb-4 border border-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2">
          <p class="text-[10px] font-bold text-red-700 dark:text-red-300">{{ listError() }}</p>
        </div>
      }

      <div class="flex-grow overflow-y-auto custom-scrollbar border-2 border-black dark:border-white bg-white dark:bg-gray-900 relative">
        <div class="min-w-full inline-block align-middle">
          <table class="w-full border-collapse text-sm table-fixed min-w-[800px]">
            <thead class="sticky top-0 z-20">
              <tr class="bg-black text-white dark:bg-white dark:text-black">
                <th (click)="toggleSort('title')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors border-r border-white/20 dark:border-black/20">
                  <div class="flex items-center justify-between">
                    <span class="group-hover:translate-x-0.5 transition-transform duration-200">Session Goal</span>
                    <span class="ml-2 font-mono">
                      @if (sortBy() === 'title') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                      @else { <span class="opacity-0 group-hover:opacity-50 transition-opacity">↓</span> }
                    </span>
                  </div>
                </th>
                <th (click)="toggleSort('software_version')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-32 border-r border-white/20 dark:border-black/20">
                  <div class="flex items-center justify-between">
                    <span class="group-hover:translate-x-0.5 transition-transform duration-200">Version</span>
                    <span class="ml-2 font-mono">
                      @if (sortBy() === 'software_version') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                      @else { <span class="opacity-0 group-hover:opacity-50 transition-opacity">↓</span> }
                    </span>
                  </div>
                </th>
                <th (click)="toggleSort('machine_name')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden md:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-32 border-r border-white/20 dark:border-black/20">
                  <div class="flex items-center justify-between">
                    <span class="group-hover:translate-x-0.5 transition-transform duration-200">Machine</span>
                    <span class="ml-2 font-mono">
                      @if (sortBy() === 'machine_name') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                      @else { <span class="opacity-0 group-hover:opacity-50 transition-opacity">↓</span> }
                    </span>
                  </div>
                </th>
                <th class="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden lg:table-cell w-32 border-r border-white/20 dark:border-black/20">
                  Creator
                </th>
                <th (click)="toggleSort('created_at')" class="group cursor-pointer px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest hidden sm:table-cell hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-40 border-r border-white/20 dark:border-black/20">
                  <div class="flex items-center justify-between">
                    <span class="group-hover:translate-x-0.5 transition-transform duration-200">Created</span>
                    <span class="ml-2 font-mono">
                      @if (sortBy() === 'created_at') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                      @else { <span class="opacity-0 group-hover:opacity-50 transition-opacity">↓</span> }
                    </span>
                  </div>
                </th>
                <th (click)="toggleSort('status')" class="group cursor-pointer px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-28">
                  <div class="flex items-center justify-end">
                    <span class="group-hover:-translate-x-0.5 transition-transform duration-200">Status</span>
                    <span class="ml-2 font-mono">
                      @if (sortBy() === 'status') { {{ sortOrder() === 'ASC' ? '↑' : '↓' }} }
                      @else { <span class="opacity-0 group-hover:opacity-50 transition-opacity">↓</span> }
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-black/10 dark:divide-white/10">
              @for (session of sessions(); track session.id; let i = $index) {
                <tr 
                  class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group leading-tight relative overflow-hidden animate-in slide-in-from-left-4 fade-in duration-500 fill-mode-both"
                  [style.animation-delay]="(i * 50) + 'ms'"
                >
                  <td class="px-4 py-2 group-hover:pl-5 transition-all duration-200 border-r border-black/10 dark:border-white/10 relative">
                    <!-- Selection Indicator - Now inside TD -->
                    <div class="absolute left-0 top-0 bottom-0 w-1 bg-black dark:bg-white scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top"></div>
                    
                    <div class="flex flex-col">
                      <span class="text-xs font-black text-gray-900 dark:text-white group-hover:underline decoration-black dark:decoration-white decoration-2 cursor-pointer uppercase tracking-tight" [routerLink]="['/sessions', session.id]">
                        {{ session.title }}
                      </span>
                      <span class="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-bold uppercase transition-colors group-hover:text-black dark:group-hover:text-white">{{ session.charter }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell border-r border-black/10 dark:border-white/10 w-32">
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] font-black font-mono text-black dark:text-white bg-black/5 dark:bg-white/10 px-1.5 py-0.5 border border-black/10 transition-colors group-hover:bg-black/10">
                        {{ session.software_version || '---' }}
                      </span>
                      @if (session.software_version && session.software_version === currentLatestVersion()) {
                        <span class="text-[8px] font-black uppercase tracking-tighter bg-black text-white dark:bg-white dark:text-black px-1 py-0.5 animate-pulse-slow">Latest</span>
                      }
                    </div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap hidden md:table-cell border-r border-black/10 dark:border-white/10 w-32">
                    <span class="text-[9px] font-black font-mono text-gray-500 dark:text-gray-400 uppercase transition-colors group-hover:text-black dark:group-hover:text-white">
                      {{ session.machine_name || '---' }}
                    </span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap hidden lg:table-cell border-r border-black/10 dark:border-white/10 w-32">
                    <span class="text-[9px] font-black uppercase text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {{ session.creator_name || 'ANONYMOUS' }}
                    </span>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap hidden sm:table-cell border-r border-black/10 dark:border-white/10 w-40">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-black font-mono text-gray-900 dark:text-white transition-colors group-hover:text-black dark:group-hover:text-white">{{ session.created_at | date:'yyyy-MM-dd' }}</span>
                      <span class="text-[9px] font-bold font-mono text-gray-400 dark:text-gray-500 group-hover:text-gray-600 transition-colors">{{ session.created_at | date:'HH:mm' }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-2 whitespace-nowrap text-right w-28">
                    <span 
                      [class]="'px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter border-2 inline-block transition-all duration-300 group-hover:scale-105 ' + statusClasses(session.status)"
                    >
                      {{ session.status }}
                    </span>
                  </td>
                </tr>
              } @empty {
                @if (!isLoading()) {
                  <tr>
                    <td colspan="5" class="px-4 py-24 text-center bg-gray-50/50 dark:bg-gray-800/20">
                      <div class="max-w-md mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-500">
                        <div class="space-y-1">
                          <h3 class="text-lg font-black uppercase tracking-tighter text-gray-900 dark:text-white">Manifest Empty</h3>
                          <p class="text-[10px] font-bold text-gray-400 uppercase leading-relaxed tracking-wider">
                            No sessions match the active filters.
                          </p>
                        </div>
                        <app-button size="sm" class="active:scale-95 transition-transform" (onClick)="openCreateModal()">+ Create session</app-button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      @if (hasMore()) {
        <div class="flex-shrink-0 flex justify-center pt-6">
          <app-button variant="secondary" size="sm" [disabled]="isLoading()" (onClick)="loadMore()" class="active:scale-95 transition-transform">
            {{ isLoading() ? 'Loading...' : 'Load more sessions' }}
          </app-button>
        </div>
      }

      <app-modal 
        [isOpen]="isModalOpen()" 
        title="Create session" 
        (close)="isModalOpen.set(false)"
      >
        <div class="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
          @if (createError()) {
            <p role="alert" class="text-[10px] font-bold text-red-700 dark:text-red-300">{{ createError() }}</p>
          }

          <!-- Metadata Reuse Section - Refined hierarchy -->
          <div class="p-3 border-2 border-black dark:border-white space-y-3 bg-gray-50 dark:bg-gray-800/20">
            <div class="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-1.5">
              <label class="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 leading-none">Use previous session details</label>
              @if (selectedTemplate()) {
                <button (click)="clearTemplate()" class="text-[9px] font-black text-red-500 hover:underline uppercase transition-all active:scale-90">Clear</button>
              }
            </div>
            
            @if (!selectedTemplate()) {
              <app-input 
                placeholder="Search past sessions..." 
                [value]="templateSearchQuery()"
                (valueChange)="onTemplateSearch($event)"
                class="!mb-0 !text-[10px]"
              />
              @if (historicalSessions().length > 0) {
                <div class="border-t border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10 max-h-32 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                  @for (hist of historicalSessions(); track hist.id) {
                    <div 
                      (click)="applyTemplate(hist)"
                      class="px-2 py-1.5 text-[10px] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black cursor-pointer flex justify-between items-center group font-black uppercase tracking-tight transition-colors"
                    >
                      <span class="truncate group-hover:translate-x-0.5 transition-transform">{{ hist.title }}</span>
                      <span class="text-[8px] font-mono opacity-50">{{ hist.software_version || 'v?' }}</span>
                    </div>
                  }
                </div>
              }
            } @else {
              <div class="flex items-center justify-between bg-black text-white dark:bg-white dark:text-black px-2 py-1.5 text-[10px] font-black uppercase animate-in zoom-in-95 duration-200">
                <span class="truncate">Using: {{ selectedTemplate().title }}</span>
                <span class="text-[8px] font-mono opacity-70">Template active</span>
              </div>
            }
          </div>

          <app-input 
            label="Session title" 
            placeholder="Navigation Audit" 
            [value]="newSession().title"
            (valueChange)="updateNewSession('title', $event)"
          />
          <div class="space-y-1">
            <app-input 
              label="Charter" 
              type="textarea"
              placeholder="Describe what this session should cover..." 
              [value]="newSession().charter"
              (valueChange)="updateNewSession('charter', $event)"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <app-input 
              label="Machine" 
              placeholder="Test-VM-01" 
              [value]="newSession().machine_name"
              (valueChange)="updateNewSession('machine_name', $event)"
            />
            <div>
              <label class="block text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-1.5">Software version</label>
              <select
                [value]="newSession().software_version"
                (change)="updateNewSession('software_version', $any($event.target).value)"
                class="w-full px-3 py-2 min-h-11 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white sm:text-sm transition-all"
              >
                <option value="" disabled>Select a version</option>
                @for (v of availableVersions(); track v) {
                  <option [value]="v">{{ v }}</option>
                }
              </select>
            </div>
          </div>
          <app-input 
            label="Timebox (minutes)" 
            type="number"
            [value]="newSession().duration_minutes.toString()"
            (valueChange)="updateNewSession('duration_minutes', $event)"
          />
        </div>
        <div footer class="flex justify-end gap-3">
          <app-button variant="secondary" (onClick)="isModalOpen.set(false)" class="active:scale-95 transition-transform">Cancel</app-button>
          <app-button [disabled]="!isValid()" (onClick)="createSession()" class="active:scale-95 transition-transform">Create session</app-button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    .animate-pulse-slow {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      50% { opacity: .6; }
    }
  `]
})
export class SessionListComponent implements OnInit {
  private api = inject(ApiService);
  
  sessions = signal<any[]>([]);
  isModalOpen = signal(false);
  newSession = signal({ title: '', mission: '-', charter: '', software_version: '', machine_name: '', duration_minutes: 60 });
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
  listError = signal('');
  createError = signal('');

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
    this.api.getVersions().subscribe({
      next: (versions) => {
        this.availableVersions.set(versions);

        const stored = this.selectedVersion();
        if (stored && !versions.includes(stored)) {
          this.onVersionChange('');
        }
      },
      error: () => {
        this.listError.set('Could not load versions. Refresh and try again.');
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

    if (session.software_version && this.availableVersions().includes(session.software_version)) {
      this.updateNewSession('software_version', session.software_version);
    }

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
    this.listError.set('');

    this.api.getSessions(
      this.searchQuery(),
      this.limit,
      this.offset(),
      this.sortBy(),
      this.sortOrder(),
      this.selectedVersion() || undefined
    ).subscribe({
      next: (res) => {
        const current = this.sessions();
        this.sessions.set([...current, ...res.sessions]);
        this.total.set(res.pagination.total);
        this.hasMore.set(this.sessions().length < res.pagination.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.listError.set(err.error?.error || 'Could not load sessions. Check your connection and try again.');
      }
    });
  }

  loadMore() {
    this.offset.update(o => o + this.limit);
    this.loadSessions();
  }

  openCreateModal() {
    this.newSession.set({
      title: '',
      mission: '-',
      charter: '',
      software_version: this.availableVersions()[0] || '',
      machine_name: '',
      duration_minutes: 60,
    });
    this.createError.set('');
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
    return s.title && s.charter && s.software_version;
  }

  createSession() {
    this.createError.set('');

    this.api.createSession(this.newSession()).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadVersions();
        this.resetAndLoad();
      },
      error: (err) => {
        this.createError.set(err.error?.error || 'Could not create session. Check the form and try again.');
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
