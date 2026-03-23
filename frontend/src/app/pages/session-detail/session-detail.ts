import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';
import { InputComponent } from '../../components/input/input';
import { ModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, CardComponent, InputComponent, ModalComponent],
  template: `
    <div class="space-y-6">
    @if (session()) {
      <div class="flex justify-between items-start">
        <div>
          <nav class="flex mb-2" aria-label="Breadcrumb">
            <ol class="flex items-center space-x-2 text-sm text-gray-500">
              <li><a routerLink="/sessions" class="hover:text-blue-600">Sessions</a></li>
              <li><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/></svg></li>
              <li class="font-medium text-gray-900">{{ session()?.title }}</li>
            </ol>
          </nav>
          <div class="flex items-center gap-3">
            <h2 class="text-3xl font-bold text-gray-900">{{ session()?.title }}</h2>
            @if (session()?.status === 'in-progress') {
              <div class="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold animate-pulse">
                <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ timeRemaining() }}
              </div>
            }
          </div>
        </div>
        
        <div class="flex space-x-3">
          @if (session()?.status === 'planned') {
            <app-button (onClick)="openStartModal()">Start Session</app-button>
          } @else if (session()?.status === 'in-progress') {
            <app-button variant="danger" (onClick)="moveToDebriefing()">End Testing</app-button>
          } @else if (session()?.status === 'debriefing') {
            <app-button (onClick)="completeSession()">Finish Session</app-button>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sidebar: Info -->
        <div class="lg:col-span-1 space-y-6">
          <app-card title="Charter (Scope & Approach)">
            <p class="text-sm text-gray-600">{{ session()?.charter }}</p>
          </app-card>
          
          <app-card title="Mission (Specific Goal)">
            <p class="text-sm text-gray-600">{{ session()?.mission }}</p>
          </app-card>

          <app-card title="Details">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4">
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Status</dt>
                <dd class="mt-1 text-sm font-semibold uppercase tracking-wider" [class]="statusColor(session()?.status)">{{ session()?.status }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Timebox</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ session()?.duration_minutes }} minutes</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Machine Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ session()?.machine_name || 'N/A' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">Start Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ (session()?.start_time | date:'medium') || 'Not started' }}</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-gray-500 uppercase">End Time</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ (session()?.end_time | date:'medium') || 'N/A' }}</dd>
              </div>
            </dl>
          </app-card>
        </div>

        <!-- Main: Logs & Artifacts -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Debrief Summary -->
          @if (session()?.status === 'debriefing' || session()?.status === 'completed') {
            <app-card title="Briefing / Debrief Summary">
              @if (session()?.status === 'debriefing') {
                <div class="space-y-4">
                  <app-input 
                    type="textarea" 
                    placeholder="Provide a summary of the testing session, main findings, and follow-ups..." 
                    [value]="debriefSummary()"
                    (valueChange)="debriefSummary.set($event)"
                  />
                  <div class="flex justify-end">
                    <app-button (onClick)="saveDebriefSummary()">Save Summary</app-button>
                  </div>
                </div>
              } @else {
                <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ session()?.debrief_summary || 'No summary provided.' }}</p>
              }
            </app-card>
          }

          <!-- Real-time Logging -->
          @if (session()?.status === 'in-progress' || session()?.status === 'debriefing') {
            <app-card title="Add Log Entry">
              <div class="space-y-4">
                <app-input 
                  type="textarea" 
                  placeholder="What are you seeing?" 
                  [value]="logEntry()"
                  (valueChange)="logEntry.set($event)"
                />
                
                @if (selectedArtifacts().length > 0) {
                  <div class="flex flex-wrap gap-2">
                    @for (art of selectedArtifacts(); track art.id) {
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {{ art.name }}
                        <button (click)="unselectArtifact(art.id)" class="ml-1 text-blue-400 hover:text-blue-600">×</button>
                      </span>
                    }
                  </div>
                }

                <div class="flex justify-between items-center">
                  <div class="flex space-x-2">
                    <app-button variant="ghost" [class.bg-blue-50]="logCategory() === 'note'" (onClick)="logCategory.set('note')">Note</app-button>
                    <app-button variant="ghost" [class.bg-green-50]="logCategory() === 'finding'" (onClick)="logCategory.set('finding')">Finding</app-button>
                    <app-button variant="ghost" [class.bg-red-50]="logCategory() === 'issue'" (onClick)="logCategory.set('issue')">Issue</app-button>
                  </div>
                  <app-button [disabled]="!logEntry() || isSubmittingLog()" (onClick)="submitLog()">Post Log</app-button>
                </div>
              </div>
            </app-card>
          }

          <!-- Log Timeline -->
          <app-card title="Log Timeline">
            <div class="flow-root">
              <ul role="list" class="-mb-8">
                @for (log of logs(); track log.id; let last = $last) {
                  <li>
                    <div class="relative pb-8">
                      @if (!last || hasMoreLogs()) {
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
                        <div class="min-w-0 flex-1 pt-1.5 space-y-2">
                          <div class="flex justify-between space-x-4">
                            <div>
                              <p class="text-sm text-gray-800">{{ log.content }}</p>
                            </div>
                            <div class="text-right text-xs whitespace-nowrap text-gray-500">
                              {{ log.timestamp | date:'shortTime' }}
                              <span class="ml-2 italic">by {{ log.author }}</span>
                            </div>
                          </div>
                          
                          @if (log.artifacts && log.artifacts.length > 0) {
                            <div class="flex flex-wrap gap-2">
                              @for (art of log.artifacts; track art.id) {
                                <div (click)="downloadArtifact(art)" class="flex items-center space-x-1 px-2 py-0.5 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer">
                                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
                                  <span>{{ art.name }}</span>
                                </div>
                              }
                            </div>
                          }

                          @if (session()?.status !== 'completed') {
                            <button (click)="openLinkModal(log)" class="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                              <svg class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/></svg>
                              Attach Artifacts
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </li>
                } @empty {
                  <p class="text-center text-gray-500 italic py-4">No logs yet.</p>
                }
              </ul>

              @if (hasMoreLogs()) {
                <div class="flex justify-center mt-4">
                  <app-button variant="ghost" [disabled]="isLoadingLogs()" (onClick)="loadMoreLogs()">
                    {{ isLoadingLogs() ? 'Loading...' : 'Load Earlier Logs' }}
                  </app-button>
                </div>
              }
            </div>
          </app-card>

          <!-- Artifacts -->
          <app-card title="Artifacts">
            <div class="flex justify-between mb-4">
              <p class="text-xs text-gray-500">Log files, screenshots, Zips, etc.</p>
              @if (session()?.status === 'in-progress' || session()?.status === 'debriefing') {
                <div class="flex items-center space-x-2">
                   @if (isUploading()) {
                    <span class="text-xs text-blue-600 animate-pulse">Processing...</span>
                  }
                  <input type="file" #fileInput class="hidden" multiple (change)="uploadFiles($event)">
                  <app-button variant="secondary" [disabled]="isUploading()" (onClick)="fileInput.click()">Upload Artifacts</app-button>
                </div>
              }
            </div>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              @for (art of artifacts(); track art.id) {
                <div class="group relative flex flex-col items-center p-2 border border-gray-100 rounded hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer" [class.bg-blue-50]="isArtifactSelected(art.id)" (click)="toggleArtifactSelection(art)">
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
                  
                  @if (isArtifactSelected(art.id)) {
                    <div class="absolute top-1 right-1 h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
                  }
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

    <!-- Start Session Modal -->
    <app-modal [isOpen]="isStartModalOpen()" title="Start Session" (close)="isStartModalOpen.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Please confirm the machine name before starting the session.</p>
        <app-input 
          label="Machine Name" 
          placeholder="e.g. Test-VM-01" 
          [value]="machineName()"
          (valueChange)="machineName.set($event)"
        />
      </div>
      <div footer>
        <app-button variant="secondary" (onClick)="isStartModalOpen.set(false)">Cancel</app-button>
        <app-button [disabled]="!machineName()" (onClick)="startSession()">Start Now</app-button>
      </div>
    </app-modal>

    <!-- Link Artifacts Modal -->
    <app-modal [isOpen]="isLinkModalOpen()" title="Link Artifacts" (close)="isLinkModalOpen.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-gray-600">Select artifacts to link to this log entry.</p>
        <div class="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
          @for (art of artifacts(); track art.id) {
            <div 
              (click)="toggleLinkSelection(art.id)"
              [class]="'p-2 border rounded text-xs cursor-pointer truncate ' + (tempLinkSelection().includes(art.id) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600')"
            >
              {{ art.name }}
            </div>
          }
        </div>
      </div>
      <div footer>
        <app-button variant="secondary" (onClick)="isLinkModalOpen.set(false)">Cancel</app-button>
        <app-button (onClick)="linkArtifacts()">Link Selected</app-button>
      </div>
    </app-modal>
    </div>
  `,
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  session = signal<any>(null);
  logs = signal<any[]>([]);
  artifacts = signal<any[]>([]);
  
  logEntry = signal('');
  logCategory = signal('note');
  debriefSummary = signal('');
  isUploading = signal(false);
  isSubmittingLog = signal(false);
  
  // Selection for linking
  selectedArtifacts = signal<any[]>([]);
  
  // Pagination state for logs
  logLimit = 20;
  logOffset = signal(0);
  hasMoreLogs = signal(false);
  isLoadingLogs = signal(false);
  
  // Modals
  isStartModalOpen = signal(false);
  machineName = signal('');
  
  isLinkModalOpen = signal(false);
  activeLogToLink = signal<any>(null);
  tempLinkSelection = signal<number[]>([]);

  // Timer logic
  currentTime = signal(new Date());
  private timerInterval?: any;

  timeRemaining = computed(() => {
    const s = this.session();
    if (!s || s.status !== 'in-progress' || !s.start_time) return '00:00';
    
    const start = new Date(s.start_time).getTime();
    const durationMs = s.duration_minutes * 60 * 1000;
    const end = start + durationMs;
    const remainingMs = end - this.currentTime().getTime();
    
    if (remainingMs <= 0) return 'TIME EXPIRED';
    
    const totalSeconds = Math.floor(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  ngOnInit() {
    this.loadSession();
    this.timerInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadSession() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getSession(id).subscribe(session => {
      // The session endpoint returns initial logs and artifacts
      this.session.set(session);
      this.logs.set(session.logs);
      this.artifacts.set(session.artifacts);
      this.debriefSummary.set(session.debrief_summary || '');
      
      // Check if there might be more logs based on the returned count
      // (Backend detail endpoint returns all, but we might want to paginate later)
      // For now, let's assume we want to handle pagination strictly via /logs/session/:id
      this.hasMoreLogs.set(false); 
      
      if (session.machine_name) this.machineName.set(session.machine_name);
    });
  }

  saveDebriefSummary() {
    const id = this.session().id;
    this.api.updateSession(id, { debrief_summary: this.debriefSummary() }).subscribe(updated => {
      this.session.update(s => ({ ...s, ...updated }));
    });
  }

  loadMoreLogs() {
    this.isLoadingLogs.set(true);
    const id = this.session().id;
    this.api.getLogs(id, this.logLimit, this.logOffset() + this.logLimit).subscribe(res => {
      this.logs.update(current => [...res.logs, ...current]);
      this.logOffset.update(o => o + this.logLimit);
      this.hasMoreLogs.set(this.logs().length < res.pagination.total);
      this.isLoadingLogs.set(false);
    });
  }

  openStartModal() {
    this.isStartModalOpen.set(true);
  }

  startSession() {
    const id = this.session().id;
    this.api.updateSession(id, { 
      status: 'in-progress', 
      machine_name: this.machineName()
    }).subscribe(updated => {
      this.isStartModalOpen.set(false);
      this.session.update(s => ({ ...s, ...updated }));
    });
  }

  moveToDebriefing() {
    const id = this.session().id;
    this.api.updateSession(id, { status: 'debriefing' }).subscribe(updated => {
      this.session.update(s => ({ ...s, ...updated }));
    });
  }

  completeSession() {
    const id = this.session().id;
    this.api.updateSession(id, { status: 'completed' }).subscribe(updated => {
      this.session.update(s => ({ ...s, ...updated }));
    });
  }

  submitLog() {
    if (!this.logEntry() || this.isSubmittingLog()) return;
    
    this.isSubmittingLog.set(true);
    this.api.createLog({
      session_id: this.session().id,
      content: this.logEntry(),
      category: this.logCategory(),
      author: 'tester',
      artifact_ids: this.selectedArtifacts().map(a => a.id)
    }).subscribe({
      next: (newLog) => {
        // Incremental update: append new log to the end (since order is ASC)
        this.logs.update(l => [...l, newLog]);
        this.logEntry.set('');
        this.selectedArtifacts.set([]);
        this.isSubmittingLog.set(false);
      },
      error: () => this.isSubmittingLog.set(false)
    });
  }

  uploadFiles(event: any) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('session_id', this.session().id.toString());

    this.api.uploadArtifact(formData).subscribe({
      next: (newArtifacts) => {
        // Incremental update: append new artifacts
        this.artifacts.update(a => [...a, ...newArtifacts]);
        this.isUploading.set(false);
      },
      error: () => this.isUploading.set(false)
    });
  }

  isArtifactSelected(id: number) {
    return this.selectedArtifacts().some(a => a.id === id);
  }

  toggleArtifactSelection(art: any) {
    if (this.session()?.status === 'completed') {
      this.downloadArtifact(art);
      return;
    }

    const current = this.selectedArtifacts();
    const index = current.findIndex(a => a.id === art.id);
    if (index > -1) {
      this.selectedArtifacts.set(current.filter(a => a.id !== art.id));
    } else {
      this.selectedArtifacts.set([...current, art]);
    }
  }

  unselectArtifact(id: number) {
    this.selectedArtifacts.update(arr => arr.filter(a => a.id !== id));
  }

  // Linking existing logs
  openLinkModal(log: any) {
    this.activeLogToLink.set(log);
    this.tempLinkSelection.set(log.artifacts.map((a: any) => a.id));
    this.isLinkModalOpen.set(true);
  }

  toggleLinkSelection(id: number) {
    const current = this.tempLinkSelection();
    if (current.includes(id)) {
      this.tempLinkSelection.set(current.filter(x => x !== id));
    } else {
      this.tempLinkSelection.set([...current, id]);
    }
  }

  linkArtifacts() {
    const logId = this.activeLogToLink().id;
    this.api.linkArtifactsToLog(logId, this.tempLinkSelection()).subscribe(() => {
      // Update local log artifacts incrementally
      const updatedArtifacts = this.artifacts().filter(a => this.tempLinkSelection().includes(a.id));
      this.logs.update(list => list.map(l => 
        l.id === logId ? { ...l, artifacts: updatedArtifacts } : l
      ));
      this.isLinkModalOpen.set(false);
    });
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

  statusColor(status: string) {
    switch (status) {
      case 'in-progress': return 'text-green-600';
      case 'debriefing': return 'text-yellow-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  }

  categoryIconClass(cat: string) {
    switch (cat) {
      case 'issue': return 'bg-red-500 text-white';
      case 'finding': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  }
}
