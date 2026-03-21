import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';
import { InputComponent } from '../../components/input/input';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, CardComponent, InputComponent],
  template: `
    <div class="space-y-6" @if (session()) {
      <div class="flex justify-between items-start">
        <div>
          <nav class="flex mb-2" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2 text-sm text-gray-500">
              <li><a routerLink="/sessions" class="hover:text-blue-600">Sessions</a></li>
              <li><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg></li>
              <li class="font-medium text-gray-900">{{ session()?.title }}</li>
            </ol>
          </nav>
          <h2 class="text-3xl font-bold text-gray-900">{{ session()?.title }}</h2>
        </div>
        
        <div class="flex space-x-3">
          @if (session()?.status === 'planned') {
            <app-button (onClick)="startSession()">Start Session</app-button>
          } @else if (session()?.status === 'in-progress') {
            <app-button variant="danger" (onClick)="stopSession()">Stop Session</app-button>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sidebar: Info -->
        <div class="lg:col-span-1 space-y-6">
          <app-card title="Mission">
            <p class="text-sm text-gray-600">{{ session()?.mission }}</p>
          </app-card>
          
          <app-card title="Charter">
            <p class="text-sm text-gray-600">{{ session()?.charter }}</p>
          </app-card>

          <app-card title="Details">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Status</dt>
                <dd class="mt-1 text-sm text-gray-900 font-semibold uppercase tracking-wider">{{ session()?.status }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Start Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ session()?.start_time | date:'medium' || 'Not started' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">End Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ session()?.end_time | date:'medium' || 'N/A' }}</dd>
              </div>
            </dl>
          </app-card>
        </div>

        <!-- Main: Logs & Artifacts -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Real-time Logging -->
          @if (session()?.status === 'in-progress') {
            <app-card title="Add Log Entry">
              <div class="space-y-4">
                <app-input 
                  type="textarea" 
                  placeholder="What are you seeing?" 
                  [value]="logEntry()"
                  (valueChange)="logEntry.set($event)"
                />
                <div class="flex justify-between items-center">
                  <div class="flex space-x-2">
                    <app-button variant="ghost" [class.bg-blue-50]="logCategory() === 'note'" (onClick)="logCategory.set('note')">Note</app-button>
                    <app-button variant="ghost" [class.bg-green-50]="logCategory() === 'finding'" (onClick)="logCategory.set('finding')">Finding</app-button>
                    <app-button variant="ghost" [class.bg-red-50]="logCategory() === 'issue'" (onClick)="logCategory.set('issue')">Issue</app-button>
                  </div>
                  <app-button (onClick)="submitLog()">Post Log</app-button>
                </div>
              </div>
            </app-card>
          }

          <!-- Log Timeline -->
          <app-card title="Log Timeline">
            <div class="flow-root">
              <ul role="list" class="-mb-8">
                @for (log of session()?.logs; track log.id; let last = $last) {
                  <li>
                    <div class="relative pb-8">
                      @if (!last) {
                        <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                      }
                      <div class="relative flex space-x-3">
                        <div>
                          <span [class]="'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ' + categoryIconClass(log.category)">
                            @if (log.category === 'issue') { ! }
                            @else if (log.category === 'finding') { * }
                            @else { i }
                          </span>
                        </div>
                        <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p class="text-sm text-gray-800">{{ log.content }}</p>
                          </div>
                          <div class="text-right text-xs whitespace-nowrap text-gray-500">
                            {{ log.timestamp | date:'shortTime' }}
                            <span class="ml-2 italic">by {{ log.author }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                } @empty {
                  <p class="text-center text-gray-500 italic py-4">No logs yet.</p>
                }
              </ul>
            </div>
          </app-card>

          <!-- Artifacts -->
          <app-card title="Artifacts">
            <div class="flex justify-between mb-4">
              <p class="text-xs text-gray-500">Log files, screenshots, etc.</p>
              @if (session()?.status === 'in-progress') {
                <input type="file" #fileInput class="hidden" (change)="uploadFile($event)">
                <app-button variant="secondary" (onClick)="fileInput.click()">Upload Artifact</app-button>
              }
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @for (art of session()?.artifacts; track art.id) {
                <div class="group relative flex flex-col items-center p-2 border border-gray-100 rounded hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer" (click)="downloadArtifact(art)">
                  @if (isImage(art.name)) {
                    <div class="h-24 w-full bg-gray-100 rounded flex items-center justify-center overflow-hidden mb-2">
                       <img [src]="getArtifactUrl(art.id)" class="h-full w-full object-cover">
                    </div>
                  } @else {
                    <div class="h-24 w-full bg-gray-200 rounded flex items-center justify-center mb-2">
                       <span class="text-xs text-gray-500 uppercase">{{ art.type }}</span>
                    </div>
                  }
                  <span class="text-xs text-gray-700 truncate w-full text-center" [title]="art.name">{{ art.name }}</span>
                </div>
              } @empty {
                <p class="col-span-full text-center text-gray-400 text-xs italic">No artifacts captured.</p>
              }
            </div>
          </app-card>
        </div>
      </div>
    } @else {
      <div class="flex justify-center py-20">
        <p class="text-gray-500 animate-pulse">Loading session details...</p>
      </div>
    }
    </div>
  `,
})
export class SessionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  session = signal<any>(null);
  logEntry = signal('');
  logCategory = signal('note');

  ngOnInit() {
    this.loadSession();
  }

  loadSession() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getSession(id).subscribe(session => {
      this.session.set(session);
    });
  }

  startSession() {
    const id = this.session().id;
    this.api.updateSession(id, { 
      status: 'in-progress', 
      start_time: new Date().toISOString() 
    }).subscribe(() => this.loadSession());
  }

  stopSession() {
    const id = this.session().id;
    this.api.updateSession(id, { 
      status: 'completed', 
      end_time: new Date().toISOString() 
    }).subscribe(() => this.loadSession());
  }

  submitLog() {
    if (!this.logEntry()) return;
    
    this.api.createLog({
      session_id: this.session().id,
      content: this.logEntry(),
      category: this.logCategory(),
      author: 'tester'
    }).subscribe(() => {
      this.logEntry.set('');
      this.loadSession();
    });
  }

  uploadFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', this.session().id.toString());
    formData.append('type', this.getFileType(file.name));

    this.api.uploadArtifact(formData).subscribe(() => this.loadSession());
  }

  getFileType(name: string) {
    if (this.isImage(name)) return 'screenshot';
    if (name.endsWith('.log')) return 'log';
    return 'measurement';
  }

  isImage(name: string) {
    return /\.(jpg|jpeg|png|gif)$/i.test(name);
  }

  getArtifactUrl(id: number) {
    return this.api.getArtifactUrl(id);
  }

  downloadArtifact(art: any) {
    window.open(this.getArtifactUrl(art.id), '_blank');
  }

  categoryIconClass(cat: string) {
    switch (cat) {
      case 'issue': return 'bg-red-500 text-white';
      case 'finding': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  }
}
