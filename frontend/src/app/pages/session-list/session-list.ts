import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';
import { ModalComponent } from '../../components/modal/modal';
import { InputComponent } from '../../components/input/input';

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
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Testing Sessions</h2>
        <app-button (onClick)="openCreateModal()">New Session</app-button>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (session of sessions(); track session.id) {
          <app-card [title]="session.title">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm font-medium text-gray-500">Status:</span>
                <span [class]="'px-2 py-0.5 rounded text-xs font-semibold ' + statusClasses(session.status)">
                  {{ session.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600 line-clamp-2">{{ session.mission }}</p>
            </div>
            <div footer class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <app-button variant="ghost" [routerLink]="['/sessions', session.id]">View Details</app-button>
            </div>
          </app-card>
        } @empty {
          <div class="col-span-full text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <p class="text-gray-500 italic">No sessions found. Create one to get started!</p>
          </div>
        }
      </div>

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
            label="Mission" 
            type="textarea"
            placeholder="What is the overall goal?" 
            [value]="newSession().mission"
            (valueChange)="updateNewSession('mission', $event)"
          />
          <app-input 
            label="Charter" 
            type="textarea"
            placeholder="Specific area or features to explore" 
            [value]="newSession().charter"
            (valueChange)="updateNewSession('charter', $event)"
          />
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
  newSession = signal({ title: '', mission: '', charter: '' });

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.api.getSessions().subscribe(sessions => {
      this.sessions.set(sessions);
    });
  }

  openCreateModal() {
    this.newSession.set({ title: '', mission: '', charter: '' });
    this.isModalOpen.set(true);
  }

  updateNewSession(field: string, value: string) {
    this.newSession.update(s => ({ ...s, [field]: value }));
  }

  isValid() {
    const s = this.newSession();
    return s.title && s.mission && s.charter;
  }

  createSession() {
    this.api.createSession(this.newSession()).subscribe(() => {
      this.isModalOpen.set(false);
      this.loadSessions();
    });
  }

  statusClasses(status: string) {
    switch (status) {
      case 'in-progress': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }
}
