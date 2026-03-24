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
    <div class="flex flex-col h-screen max-w-[1600px] mx-auto overflow-hidden px-2 sm:px-6">
    @if (session()) {
      <!-- 1. HEADER AREA (Locked Top) -->
      <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white pb-3 pt-2 relative z-[100]">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div class="space-y-0.5 w-full md:w-auto">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                <li><a routerLink="/sessions" class="hover:underline">Manifest</a></li>
                <li>/</li>
                <li class="text-black dark:text-white font-mono">ID:{{ session()?.id }}</li>
              </ol>
            </nav>
            <h2 class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none break-words">
              {{ session()?.title }}
            </h2>
          </div>
          
          <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
            @if (session()?.status === 'in-progress') {
              <div class="flex items-center px-2 py-1 bg-black text-white dark:bg-white dark:text-black font-mono text-xs border-2 border-black dark:border-white">
                <span class="mr-1.5 opacity-50">T-</span>{{ timeRemaining() }}
              </div>
            } @else if (session()?.status === 'completed') {
              <div class="flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[9px] font-black border border-gray-300 dark:border-gray-700 uppercase tracking-widest">
                ARCHIVED
              </div>
            }
            
            <div class="flex flex-grow md:flex-grow-0 bg-white dark:bg-gray-900 border border-black dark:border-white p-0.5 justify-center">
              @if (session()?.status === 'planned') {
                <app-button size="sm" class="w-full md:w-auto" (onClick)="openStartModal()">BEGIN</app-button>
              } @else if (session()?.status === 'in-progress') {
                <app-button variant="danger" size="sm" class="w-full md:w-auto" (onClick)="moveToDebriefing()">END</app-button>
              } @else if (session()?.status === 'debriefing') {
                <app-button size="sm" class="w-full md:w-auto" (onClick)="completeSession()">FINALIZE</app-button>
              }
            </div>
          </div>
        </div>

        <!-- 2. PERSISTENT BRIEF (Locked Top Layer 2) -->
        <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 border-2 border-black dark:border-white grid grid-cols-1 md:grid-cols-2 gap-3 relative z-[90]">
          <div>
            <span class="text-[8px] font-black uppercase tracking-widest text-gray-500 block mb-0.5 italic">Charter</span>
            <h3 class="text-[10px] sm:text-xs font-black text-black dark:text-white uppercase line-clamp-1 border-l-2 border-black/10 pl-2">{{ session()?.charter }}</h3>
          </div>
          <div class="md:border-l md:pl-4 border-black/10">
            <span class="text-[8px] font-black uppercase tracking-widest text-gray-500 block mb-0.5 italic">Mission</span>
            <p class="text-[10px] sm:text-xs font-bold text-gray-800 dark:text-gray-200 italic line-clamp-1 border-l-2 border-black/10 pl-2">"{{ session()?.mission }}"</p>
          </div>
        </div>
      </div>

      <!-- 3. MAIN WORK AREA -->
      <div class="flex-grow overflow-hidden pt-3 pb-2">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start overflow-y-auto lg:overflow-hidden pr-1 custom-scrollbar">
          
          <!-- TIMELINE COLUMN (Left Reference - 5/12) -->
          <div class="order-2 lg:order-1 lg:col-span-5 h-auto lg:h-full flex flex-col min-h-0 relative z-10 lg:overflow-y-auto lg:pr-4 custom-scrollbar">
            
            <!-- Post-Session Briefing -->
            @if (session()?.status === 'debriefing' || session()?.status === 'completed') {
              <div class="mb-4">
                <app-card title="Post-Testing Summary">
                  @if (session()?.status === 'debriefing') {
                    <div class="space-y-3">
                      <app-input 
                        type="textarea" 
                        placeholder="SUMMARIZE FINDINGS..." 
                        [value]="debriefSummary()"
                        (valueChange)="debriefSummary.set($event)"
                      />
                      <div class="flex justify-end">
                        <app-button (onClick)="saveDebriefSummary()">SAVE REPORT</app-button>
                      </div>
                    </div>
                  } @else {
                    <p class="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">{{ session()?.debrief_summary || 'NO REPORT FILED.' }}</p>
                  }
                </app-card>
              </div>
            }

            <app-card title="Execution Log">
              <div header-actions>
                <button 
                  (click)="toggleLogSort()" 
                  class="p-1 border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                  [title]="'Switch to ' + (logSortOrder() === 'ASC' ? 'Newest First' : 'Oldest First')"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
                    @if (logSortOrder() === 'ASC') {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    }
                  </svg>
                </button>
              </div>
              <div class="flow-root min-h-[300px]">
                <ul role="list" class="-mb-8">
                  @for (log of sortedLogs(); track log.id; let last = $last) {
                    <li>
                      <div class="relative pb-8">
                        @if (!last) {
                          <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-black dark:bg-white opacity-10" aria-hidden="true"></span>
                        }
                        <div class="relative flex space-x-3">
                          <div class="flex-shrink-0">
                            <span [class]="'h-6 w-6 flex items-center justify-center border-2 border-black dark:border-white font-black text-[9px] ' + categoryIconClass(log.category)">
                              {{ log.category.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                          <div class="min-w-0 flex-1 pt-1 space-y-2">
                            <div class="flex justify-between items-start space-x-2">
                              <p class="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug break-words tracking-tight">{{ log.content }}</p>
                              <div class="text-[8px] font-black font-mono text-gray-400 whitespace-nowrap pt-0.5">
                                {{ log.timestamp | date:'HH:mm' }}
                              </div>
                            </div>
                            
                            @if (log.artifacts && log.artifacts.length > 0) {
                              <div class="flex flex-wrap gap-1">
                                @for (art of log.artifacts; track art.id) {
                                  <div (click)="openPreview(art)" class="flex items-center space-x-1 px-1.5 py-0.5 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-colors cursor-pointer text-[8px] font-bold uppercase tracking-tighter max-w-[100px]">
                                    <span class="truncate font-mono">{{ art.name }}</span>
                                  </div>
                                }
                              </div>
                            }

                            @if (session()?.status !== 'completed') {
                              <button (click)="openLinkModal(log)" class="text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                                + CITE
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </li>
                  }
                </ul>

                @if (hasMoreLogs()) {
                  <div class="flex justify-center mt-8 pb-10 lg:pb-0">
                    <app-button variant="ghost" [disabled]="isLoadingLogs()" (onClick)="loadMoreLogs()">LOAD MORE</app-button>
                  </div>
                }
              </div>
            </app-card>
          </div>

          <!-- TOOLBELT COLUMN (Right Workstation - 7/12) -->
          <div class="order-1 lg:order-2 lg:col-span-7 h-auto lg:h-full flex flex-col min-h-0 space-y-4 relative z-30">
            
            <!-- Capture Area -->
            <div class="flex-shrink-0 lg:sticky lg:top-0">
              @if (session()?.status === 'in-progress' || session()?.status === 'debriefing') {
                <app-card title="Active Capture" class="border-2 border-black dark:border-white">
                  <div class="space-y-3 p-1">
                    <app-input 
                      type="textarea" 
                      placeholder="RECORD FINDING..." 
                      [value]="logEntry()"
                      (valueChange)="logEntry.set($event)"
                      class="text-base font-black"
                    />
                    
                    @if (selectedArtifacts().length > 0) {
                      <div class="flex flex-wrap gap-1.5 pb-1">
                        @for (art of selectedArtifacts(); track art.id) {
                          <span class="inline-flex items-center px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black text-[8px] font-black font-mono border border-white/20 uppercase">
                            {{ art.name }}
                            <button (click)="unselectArtifact(art.id)" class="ml-1.5 opacity-50 hover:opacity-100">×</button>
                          </span>
                        }
                      </div>
                    }

                    <div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                      <div class="flex border border-black dark:border-white p-0.5 bg-white dark:bg-gray-900">
                        <button (click)="logCategory.set('note')" [class]="'px-3 py-1 text-[9px] font-black uppercase transition-all ' + (logCategory() === 'note' ? 'bg-black text-white dark:bg-white dark:text-black' : '')">Note</button>
                        <button (click)="logCategory.set('finding')" [class]="'px-3 py-1 text-[9px] font-black uppercase border-l border-black dark:border-white transition-all ' + (logCategory() === 'finding' ? 'bg-black text-white dark:bg-white dark:text-black' : '')">Finding</button>
                        <button (click)="logCategory.set('issue')" [class]="'px-3 py-1 text-[9px] font-black uppercase border-l border-black dark:border-white transition-all ' + (logCategory() === 'issue' ? 'bg-black text-white dark:bg-white dark:text-black' : '')">Issue</button>
                      </div>
                      <app-button size="md" [disabled]="!logEntry() || isSubmittingLog()" (onClick)="submitLog()">COMMIT</app-button>
                    </div>
                  </div>
                </app-card>
              }
            </div>

            <!-- Evidence Pool -->
            <div class="flex-grow overflow-hidden flex flex-col min-h-[300px] lg:min-h-0">
              <app-card title="Evidence Pool">
                <div class="flex flex-col h-full space-y-3">
                  <div class="flex justify-between items-center">
                    <div class="flex gap-1">
                      <button (click)="artifactFilter.set('all')" [class]="'px-2 py-0.5 text-[8px] font-black uppercase border ' + (artifactFilter() === 'all' ? 'bg-black text-white' : 'text-gray-400')">All</button>
                      <button (click)="artifactFilter.set('screenshot')" [class]="'px-2 py-0.5 text-[8px] font-black uppercase border ' + (artifactFilter() === 'screenshot' ? 'bg-black text-white' : 'text-gray-400')">Img</button>
                    </div>
                    
                    @if (session()?.status === 'in-progress' || session()?.status === 'debriefing') {
                      <div class="flex items-center gap-1.5">
                        <input type="file" #fileInput class="hidden" multiple (change)="uploadFiles($event)">
                        <app-button variant="secondary" size="sm" [disabled]="isUploading()" (onClick)="fileInput.click()">+ UPLOAD</app-button>
                      </div>
                    }
                  </div>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1 custom-scrollbar border-t border-black/5 pt-3 flex-grow">
                    @for (art of filteredArtifacts(); track art.id) {
                      <div class="group relative flex flex-col items-center p-2 border border-black/10 dark:border-white/10 hover:border-black transition-all cursor-pointer bg-white dark:bg-gray-900" [class.bg-gray-50]="isArtifactSelected(art.id)" (click)="toggleArtifactSelection(art)">
                        @if (isImage(art.name)) {
                          <div class="h-20 w-full bg-gray-50 flex items-center justify-center overflow-hidden mb-2 border border-black/5">
                             <img [src]="getArtifactUrl(art.id)" class="h-full w-full object-cover">
                          </div>
                        } @else {
                          <div class="h-20 w-full bg-black/5 flex items-center justify-center mb-2">
                             <span class="text-[8px] font-black uppercase opacity-30">{{ art.type }}</span>
                          </div>
                        }
                        <span class="text-[8px] font-black font-mono text-gray-500 truncate w-full text-center px-1">{{ art.name }}</span>
                        
                        <div class="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 space-y-1">
                          <button (click)="$event.stopPropagation(); openPreview(art)" class="w-full py-1 bg-white text-black text-[9px] font-black uppercase">PREVIEW</button>
                        </div>

                        @if (getLinkedLogsForArtifact(art.id).length > 0) {
                          <div class="absolute -top-1.5 -left-1.5 bg-black text-white dark:bg-white dark:text-black px-1 py-0.5 text-[7px] font-black ring-1 ring-white">CITED</div>
                        }
                      </div>
                    } @empty {
                      <p class="col-span-full text-center text-gray-400 text-[8px] font-black uppercase py-10">Pool Empty</p>
                    }
                  </div>
                </div>
              </app-card>
            </div>
          </div>
        </div>
      </div>
    } @else {
      <div class="flex justify-center py-40">
        <span class="text-sm font-black uppercase tracking-[0.5em] animate-pulse">Initializing Manifest...</span>
      </div>
    }

    <!-- Start Session Modal -->
    <app-modal [isOpen]="isStartModalOpen()" title="Start Session" (close)="isStartModalOpen.set(false)">
      <div class="space-y-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">Please confirm the machine name before starting the session.</p>
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
        <p class="text-sm text-gray-600 dark:text-gray-400 font-bold uppercase">Select artifacts to link to this log entry.</p>
        <div class="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
          @for (art of artifacts(); track art.id) {
            <div 
              (click)="toggleLinkSelection(art.id)"
              [class]="'p-2 border-2 text-[9px] font-black font-mono uppercase cursor-pointer truncate transition-all ' + (tempLinkSelection().includes(art.id) ? 'bg-black text-white border-black' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white')"
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

    <!-- Preview Modal -->
    <app-modal [isOpen]="isPreviewModalOpen()" [title]="'Preview: ' + previewArtifact()?.name" (close)="isPreviewModalOpen.set(false)">
      <div class="flex flex-col items-center">
        @if (previewArtifact()?.type === 'screenshot') {
          <img [src]="getArtifactUrl(previewArtifact()?.id)" class="max-w-full max-h-[70vh] object-contain border-4 border-black dark:border-white shadow-2xl">
        } @else if (previewArtifact()?.type === 'log') {
          <div class="w-full max-h-[70vh] overflow-auto p-6 bg-gray-950 text-gray-100 font-mono text-xs whitespace-pre-wrap selection:bg-white selection:text-black border-2 border-black">
            @if (previewContent()) {
              {{ previewContent() }}
            } @else {
              <div class="flex justify-center py-10">
                <span class="animate-pulse font-black">FETCHING BUFFER...</span>
              </div>
            }
          </div>
        } @else {
          <div class="py-20 text-center space-y-6">
            <svg class="h-20 w-20 mx-auto text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Preview unavailable.</p>
            <app-button (onClick)="downloadArtifact(previewArtifact())">Download Archive</app-button>
          </div>
        }
      </div>
      <div footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-[9px] font-black uppercase text-gray-400 font-mono">
            REF:{{ previewArtifact()?.id }}
          </div>
          <app-button variant="secondary" (onClick)="isPreviewModalOpen.set(false)">DISMISS</app-button>
        </div>
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
  isArtifactModalOpen = signal(false);
  machineName = signal('');
  
  isLinkModalOpen = signal(false);
  activeLogToLink = signal<any>(null);
  tempLinkSelection = signal<number[]>([]);

  // Artifact filtering & preview
  artifactFilter = signal<string>('all');
  logSortOrder = signal<'ASC' | 'DESC'>('ASC');
  isPreviewModalOpen = signal(false);
  previewArtifact = signal<any>(null);
  previewContent = signal<string | null>(null);
  isDebriefingMode = signal(false);

  toggleLogSort() {
    this.logSortOrder.set(this.logSortOrder() === 'ASC' ? 'DESC' : 'ASC');
  }

  filteredArtifacts = computed(() => {
    const list = this.artifacts();
    const filter = this.artifactFilter();
    if (filter === 'all') return list;
    return list.filter(a => a.type === filter);
  });

  sortedLogs = computed(() => {
    const list = [...this.logs()];
    const order = this.logSortOrder();
    return list.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return order === 'ASC' ? timeA - timeB : timeB - timeA;
    });
  });

  getCount(type: string) {
    return this.artifacts().filter(a => a.type === type).length;
  }

  getLinkedLogsForArtifact(artifactId: number) {
    return this.logs().filter(l => l.artifacts?.some((a: any) => a.id === artifactId));
  }

  openPreview(art: any) {
    this.previewArtifact.set(art);
    this.previewContent.set(null);
    this.isPreviewModalOpen.set(true);

    if (art.type === 'log') {
      fetch(this.getArtifactUrl(art.id))
        .then(res => res.text())
        .then(text => this.previewContent.set(text))
        .catch(() => this.previewContent.set('Failed to load log content.'));
    }
  }

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
    
    return `${seconds < 0 ? '00:00' : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}`;
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
      case 'in-progress': return 'text-green-600 dark:text-green-400';
      case 'debriefing': return 'text-yellow-600 dark:text-yellow-400';
      case 'completed': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  }

  categoryIconClass(cat: string) {
    switch (cat) {
      case 'issue': return 'bg-black text-white dark:bg-white dark:text-black';
      case 'finding': return 'bg-gray-400 text-white dark:bg-gray-600 dark:text-black';
      default: return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white border-2 border-black dark:border-white';
    }
  }
}
