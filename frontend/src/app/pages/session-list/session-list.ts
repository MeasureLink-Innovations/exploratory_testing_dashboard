import { Component, OnInit, signal, inject, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';
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
    CardComponent, 
    ModalComponent, 
    InputComponent
  ],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-900">Testing Sessions</h2>
        <div class="flex w-full sm:w-auto space-x-2">
           <app-input 
            placeholder="Search title or machine..." 
            [value]="searchQuery()"
            (valueChange)="onSearch($event)"
            class="w-full sm:w-64"
          />
          <app-button (onClick)="openCreateModal()">New Session</app-button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (session of sessions(); track session.id) {
          <app-card [title]="session.title">
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-gray-500">Status:</span>
                <span [class]="'px-2 py-0.5 rounded text-xs font-semibold uppercase ' + statusClasses(session.status)">
                  {{ session.status }}
                </span>
              </div>
              @if (session.machine_name) {
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-gray-500">Machine:</span>
                  <span class="text-sm text-gray-700 italic">{{ session.machine_name }}</span>
                </div>
              }
              <p class="text-sm text-gray-600 line-clamp-2">{{ session.mission }}</p>
            </div>
            <div footer class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <app-button variant="ghost" [routerLink]="['/sessions', session.id]">View Details</app-button>
            </div>
          </app-card>
        } @empty {
          @if (!isLoading()) {
            <div class="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p class="text-gray-500 italic">No sessions found. Create one to get started!</p>
            </div>
          }
        }
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
  
  // Pagination state
  total = signal(0);
  limit = 12;
  offset = signal(0);
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

  resetAndLoad() {
    this.offset.set(0);
    this.sessions.set([]);
    this.loadSessions();
  }

  loadSessions() {
    this.isLoading.set(true);
    this.api.getSessions(this.searchQuery(), this.limit, this.offset()).subscribe(res => {
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
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'debriefing': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }
}
