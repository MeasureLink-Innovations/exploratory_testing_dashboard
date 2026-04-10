import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../components/button/button';
import { CardComponent } from '../../components/card/card';
import { InputComponent } from '../../components/input/input';
import { ModalComponent } from '../../components/modal/modal';

@Component({
  selector: 'app-session-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, CardComponent, InputComponent, ModalComponent],
  template: `
    <div class="flex flex-col h-full max-w-[1600px] mx-auto overflow-hidden px-2 sm:px-6 animate-in fade-in duration-700 ease-out">
    @if (session()) {
      <!-- 1. MISSION CONTROL HEADER (OMNIPRESENT) -->
      <div class="flex-shrink-0 bg-white dark:bg-gray-900 border-b-2 border-black dark:border-white pb-4 pt-3 relative z-[100] space-y-4">
        
        <!-- Row 1: Identity & Meta -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="flex items-center gap-3">
            <a routerLink="/sessions" class="flex items-center gap-1.5 px-2 py-1 border border-black/10 hover:bg-black/5 transition-colors text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2 group">
              <svg class="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Manifest
            </a>
            <div class="bg-black text-white dark:bg-white dark:text-black px-2 py-1 font-mono text-lg font-black tracking-tighter shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] animate-in slide-in-from-left-2 duration-500">
              SESS_{{ session()?.id }}
            </div>
            <div class="flex flex-col">
              <h2 class="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none break-words animate-in slide-in-from-left-4 duration-700">
                {{ session()?.title }}
              </h2>
              <span class="text-[9px] font-black uppercase tracking-widest text-black/30 dark:text-white/30 mt-1">Creator: {{ session()?.creator_name || 'ANONYMOUS' }}</span>
            </div>
          </div>
          
          <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            @if (session()?.status === 'in-progress') {
              <div class="flex items-center px-3 py-1.5 bg-black text-white dark:bg-white dark:text-black font-mono text-sm border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] animate-heartbeat">
                <span class="mr-2 opacity-50">EXEC_TIME:</span>{{ timeRemaining() }}
              </div>
            } @else {
              <div class="px-3 py-1 border border-black/20 text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono transition-colors">
                STATUS:{{ session()?.status }}
              </div>
            }
            
            <div class="flex bg-white dark:bg-gray-900 border border-black dark:border-white p-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
              @if (session()?.status === 'planned') {
                <app-button size="sm" class="font-bold active:scale-95 transition-transform" (onClick)="openMetaModal()">Begin Session</app-button>
              } @else if (session()?.status === 'in-progress') {
                <app-button variant="danger" size="sm" class="font-bold active:scale-95 transition-transform" (onClick)="moveToDebriefing()">End Logging</app-button>
              } @else if (session()?.status === 'debriefing') {
                <app-button size="sm" class="font-bold active:scale-95 transition-transform" (onClick)="completeSession()">Finalize Manifest</app-button>
              }
            </div>
          </div>
        </div>

        <!-- Row 2: Primary Charter (High Visibility) -->
        <div class="flex flex-col md:flex-row gap-4 py-3 px-4 bg-gray-50 dark:bg-gray-800/30 border-x-2 border-y border-black dark:border-white shadow-[inset_4px_0px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:bg-gray-100 dark:hover:bg-gray-800/50 group">
          <div class="flex-grow">
            <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block mb-1 group-hover:text-black dark:group-hover:text-white transition-colors">Primary Charter Protocol</span>
            <h3 class="text-lg md:text-xl font-black text-black dark:text-white leading-tight border-l-4 border-black dark:border-white pl-4 py-1">
              {{ session()?.charter }}
            </h3>
          </div>
          <div class="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2 md:min-w-[140px] border-t md:border-t-0 md:border-l border-black/10 pt-2 md:pt-0 md:pl-4">
             <div class="flex flex-col items-start md:items-end">
               <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Target_Unit</span>
               <span class="text-[11px] font-bold text-black dark:text-white font-mono uppercase bg-black/5 dark:bg-white/5 px-1.5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">{{ session()?.machine_name || 'UNDEFINED' }}</span>
             </div>
             <div class="flex flex-col items-start md:items-end">
               <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">SW_Version</span>
               <span class="text-[11px] font-bold text-black dark:text-white font-mono uppercase bg-black/5 dark:bg-white/5 px-1.5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/10">{{ session()?.software_version || 'UNDEFINED' }}</span>
             </div>
             <div class="flex flex-col items-start md:items-end">
               <span class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Deployment_Date</span>
               <span class="text-[11px] font-bold text-gray-400 font-mono">{{ session()?.created_at | date:'yyyy-MM-dd' }}</span>
             </div>
             @if (session()?.status !== 'completed') {
               <button (click)="openMetaModal()" class="text-[9px] font-black text-blue-500 hover:underline uppercase mt-1 active:scale-90 transition-transform">Edit Meta</button>
             }
          </div>
        </div>

        <!-- Row 3: Omnipresent Observation Capture (Permanent for Layout Consistency) -->
        <div class="pt-2 border-t border-black/5 animate-in slide-in-from-top-2 duration-500">
          <div class="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">
            <div class="flex-grow relative">
              <div class="flex justify-between items-center mb-1">
                  <label class="text-[10px] font-black uppercase tracking-widest text-black/40">Observation Capture</label>
                  @if (selectedArtifacts().length > 0) {
                    <div class="flex gap-1">
                      @for (art of selectedArtifacts(); track art.id) {
                        <span class="bg-black text-white text-[8px] px-1.5 py-0.5 flex items-center font-bold animate-in zoom-in-90 duration-200">
                          {{ art.name }}
                          <button (click)="unselectArtifact(art.id)" class="ml-1 opacity-50 hover:opacity-100 transition-opacity">×</button>
                        </span>
                      }
                    </div>
                  }
              </div>
              <app-input 
                type="textarea" 
                [placeholder]="isCaptureLocked() ? 'Capture Buffer Locked - Session Not Active' : 'What are you seeing? Record notes, findings, or issues in real-time...'" 
                [value]="logEntry()"
                (valueChange)="logEntry.set($event)"
                [disabled]="isCaptureLocked()"
                class="text-sm font-bold !mb-0 transition-all focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white"
              />
              @if (isCaptureLocked()) {
                <div class="absolute inset-0 bg-gray-50/10 dark:bg-black/10 backdrop-blur-[1px] cursor-not-allowed z-10"></div>
              }
            </div>
            
            <div class="flex lg:flex-col gap-2 min-w-[160px]">
              <div class="flex border border-black dark:border-white p-0.5 bg-white dark:bg-gray-900 h-9 flex-grow shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                <button [disabled]="isCaptureLocked()" (click)="logCategory.set('note')" [class]="'flex-1 px-2 text-[9px] font-bold uppercase transition-all ' + (logCategory() === 'note' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5')">Note</button>
                <button [disabled]="isCaptureLocked()" (click)="logCategory.set('finding')" [class]="'flex-1 px-2 text-[9px] font-bold uppercase border-l border-black dark:border-white transition-all ' + (logCategory() === 'finding' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5')">Find</button>
                <button [disabled]="isCaptureLocked()" (click)="logCategory.set('issue')" [class]="'flex-1 px-2 text-[9px] font-bold uppercase border-l border-black dark:border-white transition-all ' + (logCategory() === 'issue' ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5')">Issue</button>
              </div>
              <app-button class="font-black uppercase text-[10px] h-9 active:scale-95 transition-transform" [disabled]="isCaptureLocked() || !logEntry() || isSubmittingLog()" (onClick)="submitLog()">
                Commit Observation
              </app-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MAIN WORK AREA -->
      <div class="flex-grow overflow-hidden pt-4 pb-2">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          <!-- TIMELINE COLUMN -->
          <div class="order-2 lg:order-1 lg:col-span-5 h-full flex flex-col min-h-0 relative z-10 pr-2">
            
            @if (session()?.status === 'planned') {
              <div class="mb-6 animate-in zoom-in-95 duration-500 flex-shrink-0">
                <div class="p-6 bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0 p-2 bg-white text-black dark:bg-black dark:text-white rounded-none border border-black dark:border-white animate-pulse-slow">
                      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div class="space-y-3">
                      <h4 class="text-lg font-black uppercase tracking-tight">System Ready for Execution</h4>
                      <p class="text-xs font-medium leading-relaxed opacity-90">
                        This session is in the **Planned** state. To begin your exploratory audit, you must first designate the unit (machine or environment) under test.
                      </p>
                      <div class="pt-2">
                        <app-button variant="secondary" size="sm" class="font-bold !bg-white !text-black border-black active:scale-95 transition-transform" (onClick)="openMetaModal()">Execute Start Protocol</app-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (session()?.status === 'debriefing' || session()?.status === 'completed') {
              <div class="mb-6 animate-in slide-in-from-left-4 duration-500 flex-shrink-0">
                <app-card title="Post-Testing Summary">
                  @if (session()?.status === 'debriefing') {
                    <div class="space-y-3">
                      <app-input 
                        type="textarea" 
                        placeholder="Summarize findings..." 
                        [value]="debriefSummary()"
                        (valueChange)="debriefSummary.set($event)"
                        class="transition-all focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white"
                      />
                      <div class="flex justify-end">
                        <app-button class="font-bold active:scale-95 transition-transform" (onClick)="saveDebriefSummary()">Save Report</app-button>
                      </div>
                    </div>
                  } @else {
                    <p class="text-sm text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap leading-relaxed">{{ session()?.debrief_summary || 'No report filed.' }}</p>
                  }
                </app-card>
              </div>
            }

            <app-card title="Execution Log" class="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both flex-grow min-h-0" contentClass="flex flex-col h-full">
              <div header-actions>
                <button 
                  (click)="toggleLogSort()" 
                  class="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all active:scale-90"
                  [title]="'Switch to ' + (logSortOrder() === 'ASC' ? 'Newest First' : 'Oldest First')"
                >
                  <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    @if (logSortOrder() === 'ASC') {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    } @else {
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    }
                  </svg>
                </button>
              </div>
              <div class="flow-root overflow-y-auto custom-scrollbar flex-grow min-h-0 pr-2">
                <ul role="list" class="-mb-8">
                  @for (log of sortedLogs(); track log.id; let last = $last; let i = $index) {
                    <li class="animate-in slide-in-from-left-4 fade-in duration-500 fill-mode-both" [style.animation-delay]="(i * 50) + 'ms'">
                      <div class="relative pb-8">
                        @if (!last) {
                          <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-black dark:bg-white opacity-5" aria-hidden="true"></span>
                        }
                        <div class="relative flex space-x-3">
                          <div class="flex-shrink-0">
                            <span [class]="'h-6 w-6 flex items-center justify-center border border-black dark:border-white font-bold text-[10px] transition-transform group-hover:scale-110 ' + categoryIconClass(log.category)">
                              {{ log.category.charAt(0).toUpperCase() }}
                            </span>
                          </div>
                          <div class="min-w-0 flex-1 pt-1 space-y-2">
                            <div class="flex justify-between items-start space-x-2">
                              <div class="flex flex-col">
                                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug break-words tracking-tight">{{ log.content }}</p>
                                <span class="text-[8px] font-black uppercase text-black/30 dark:text-white/30 mt-0.5">Author: {{ log.logger_name || log.author || 'ANONYMOUS' }}</span>
                              </div>
                              <div class="text-[9px] font-bold font-mono text-gray-400 whitespace-nowrap pt-0.5">
                                {{ log.timestamp | date:'HH:mm' }}
                              </div>
                            </div>
                            
                            @if (log.artifacts && log.artifacts.length > 0) {
                              <div class="flex flex-wrap gap-1">
                                @for (art of log.artifacts; track art.id) {
                                  <div (click)="openPreview(art)" class="flex items-center space-x-1 px-1.5 py-0.5 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer text-[9px] font-bold max-w-[120px] active:scale-95">
                                    <span class="truncate">{{ art.name }}</span>
                                  </div>
                                }
                              </div>
                            }

                            @if (session()?.status !== 'completed') {
                              <button (click)="openLinkModal(log)" class="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors active:translate-x-0.5">
                                + Cite Ref
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </li>
                  }
                </ul>

                @if (hasMoreLogs()) {
                  <div class="flex justify-center mt-8 pb-10">
                    <app-button variant="ghost" [disabled]="isLoadingLogs()" class="font-bold active:scale-95 transition-transform" (onClick)="loadMoreLogs()">Load More</app-button>
                  </div>
                }
              </div>
            </app-card>
          </div>

          <!-- TOOLBELT COLUMN (Artifacts & Evidence) -->
          <div class="order-1 lg:order-2 lg:col-span-7 h-full flex flex-col min-h-0 relative z-30 animate-in fade-in slide-in-from-right-4 duration-700 delay-300 fill-mode-both">
            <div class="flex-grow overflow-hidden flex flex-col min-h-0">
              <app-card title="Artifact Evidence Pool" class="h-full flex-grow" contentClass="flex flex-col h-full">
                <div class="flex flex-col h-full space-y-4">
                  <div class="flex justify-between items-center flex-shrink-0">
                    <div class="flex gap-1.5">
                      <button (click)='artifactFilter.set("all")' [class]="'px-2.5 py-1 text-[9px] font-bold uppercase border transition-all active:scale-90 ' + (artifactFilter() === 'all' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'text-gray-400 border-gray-200 hover:border-black dark:hover:border-white')">All</button>
                      <button (click)='artifactFilter.set("screenshot")' [class]="'px-2.5 py-1 text-[9px] font-bold uppercase border transition-all active:scale-90 ' + (artifactFilter() === 'screenshot' ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' : 'text-gray-400 border-gray-200 hover:border-black dark:hover:border-white')">Images</button>
                    </div>
                    
                    @if (session()?.status === 'in-progress' || session()?.status === 'debriefing') {
                      <div class="flex items-center gap-2">
                        <input type="file" #fileInput class="hidden" multiple (change)="uploadFiles($event)">
                        <app-button variant="secondary" size="sm" [disabled]="isUploading()" class="font-bold active:scale-95 transition-transform" (onClick)="fileInput.click()">+ Upload Artifacts</app-button>
                      </div>
                    }
                  </div>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-1 custom-scrollbar border-t border-black/5 pt-4 flex-grow min-h-0">
                    @for (art of filteredArtifacts(); track art.id; let i = $index) {
                      <div 
                        class="group relative flex flex-col items-center p-2 border border-black/5 dark:border-white/5 hover:border-black dark:hover:border-white transition-all cursor-pointer bg-white dark:bg-gray-900 animate-in zoom-in-95 duration-300 fill-mode-both hover:-translate-y-0.5" 
                        [class.bg-gray-50]="isArtifactSelected(art.id)" 
                        [class.dark:bg-white/5]="isArtifactSelected(art.id)"
                        [style.animation-delay]="(i * 30) + 'ms'"
                        (click)="toggleArtifactSelection(art)"
                      >
                        @if (isImage(art.name)) {
                          <div class="h-20 w-full bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden mb-2 border border-black/5 transition-transform group-hover:scale-[1.02]">
                             <img [src]="getArtifactUrl(art.id)" class="h-full w-full object-cover">
                          </div>
                        } @else {
                          <div class="h-20 w-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-2 transition-transform group-hover:scale-[1.02]">
                             <span class="text-[9px] font-bold uppercase opacity-30">{{ art.type }}</span>
                          </div>
                        }
                        <span class="text-[10px] font-bold text-gray-500 group-hover:text-black dark:group-hover:text-white truncate w-full text-center px-1 transition-colors">{{ art.name }}</span>
                        
                        <div class="absolute inset-0 bg-black/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 p-3 space-y-2 backdrop-blur-sm">
                          <button (click)="$event.stopPropagation(); openPreview(art)" class="w-full py-1.5 bg-white text-black text-[10px] font-black uppercase active:scale-95 transition-transform">Preview</button>
                        </div>

                        @if (getLinkedLogsForArtifact(art.id).length > 0) {
                          <div class="absolute -top-1.5 -left-1.5 bg-black text-white dark:bg-white dark:text-black px-1.5 py-0.5 text-[8px] font-black ring-1 ring-white shadow-sm animate-in zoom-in-75 duration-300">Cited</div>
                        }
                      </div>
                    } @empty {
                      <p class="col-span-full text-center text-gray-400 text-xs font-bold uppercase py-12 animate-in fade-in duration-1000">Buffer Empty</p>
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
        <span class="text-sm font-black uppercase tracking-[0.4em] animate-pulse">Initializing Manifest...</span>
      </div>
    }

    <!-- Metadata Modal -->
    <app-modal [isOpen]="isMetaModalOpen()" [title]="session()?.status === 'planned' ? 'Start Session' : 'Edit Metadata'" (close)="isMetaModalOpen.set(false)">
      <div class="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ session()?.status === 'planned' ? 'Confirm execution details before starting.' : 'Update deployment metadata.' }}
        </p>
        <app-input 
          label="Unit Designation (Machine)" 
          placeholder="e.g. Test-VM-01" 
          [value]="machineName()"
          (valueChange)="machineName.set($event)"
          class="transition-all focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white"
        />
        <div>
          <label class="block text-xs font-black uppercase tracking-widest text-gray-900 dark:text-gray-100 mb-1.5">Software Version</label>
          <select
            [value]="softwareVersion()"
            (change)="softwareVersion.set($any($event.target).value)"
            class="w-full px-3 py-2 min-h-11 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-none focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:focus-visible:outline-white focus:bg-gray-50 dark:focus:bg-gray-800 dark:text-white sm:text-sm transition-all"
          >
            <option value="" disabled>Select version</option>
            @for (v of availableVersions(); track v) {
              <option [value]="v">{{ v }}</option>
            }
          </select>
        </div>
      </div>
      <div footer class="flex justify-end gap-3">
        <app-button variant="secondary" class="font-bold active:scale-95 transition-transform" (onClick)="isMetaModalOpen.set(false)">Abort</app-button>
        <app-button [disabled]="!machineName() || !softwareVersion()" class="font-bold active:scale-95 transition-transform" (onClick)="saveMetadata()">
          {{ session()?.status === 'planned' ? 'Execute Start' : 'Save Changes' }}
        </app-button>
      </div>
    </app-modal>

    <!-- Link Artifacts Modal -->
    <app-modal [isOpen]="isLinkModalOpen()" title="Link Artifacts" (close)="isLinkModalOpen.set(false)">
      <div class="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
        <p class="text-[11px] font-bold uppercase tracking-widest text-gray-400">[Select Relevant Citations]</p>
        <div class="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1">
          @for (art of artifacts(); track art.id) {
            <div 
              (click)="toggleLinkSelection(art.id)"
              [class]="'p-2 border text-[10px] font-bold uppercase cursor-pointer truncate transition-all active:scale-95 ' + (tempLinkSelection().includes(art.id) ? 'bg-black text-white border-black' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white')"
            >
              {{ art.name }}
            </div>
          }
        </div>
      </div>
      <div footer class="flex justify-end gap-3">
        <app-button variant="secondary" class="font-bold active:scale-95 transition-transform" (onClick)="isLinkModalOpen.set(false)">Dismiss</app-button>
        <app-button class="font-bold active:scale-95 transition-transform" (onClick)="linkArtifacts()">Save Citations</app-button>
      </div>
    </app-modal>

    <!-- Preview Modal -->
    <app-modal [isOpen]="isPreviewModalOpen()" [title]="'Preview: ' + previewArtifact()?.name" (close)="isPreviewModalOpen.set(false)">
      <div class="flex flex-col items-center animate-in zoom-in-95 duration-300">
        @if (previewArtifact()?.type === 'screenshot') {
          <img [src]="getArtifactUrl(previewArtifact()?.id)" class="max-w-full max-h-[70vh] object-contain border-2 border-black dark:border-white shadow-xl">
        } @else if (previewArtifact()?.type === 'log') {
          <div class="w-full max-h-[70vh] overflow-auto p-6 bg-gray-950 text-gray-100 font-mono text-xs whitespace-pre-wrap selection:bg-white selection:text-black border border-black">
            @if (previewContent()) {
              {{ previewContent() }}
            } @else {
              <div class="flex justify-center py-12">
                <span class="animate-pulse font-bold">Fetching Buffer...</span>
              </div>
            }
          </div>
        } @else {
          <div class="py-20 text-center space-y-6">
            <svg class="h-20 w-20 mx-auto text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <p class="text-gray-400 font-bold uppercase tracking-widest text-[11px]">File type unsupported</p>
            <app-button class="font-bold active:scale-95 transition-transform" (onClick)="downloadArtifact(previewArtifact())">Download Archive</app-button>
          </div>
        }
      </div>
      <div footer>
        <div class="flex justify-between items-center w-full">
          <div class="text-[10px] font-bold uppercase text-gray-400">
            REF:{{ previewArtifact()?.id }}
          </div>
          <app-button variant="secondary" class="font-bold active:scale-95 transition-transform" (onClick)="isPreviewModalOpen.set(false)">Dismiss</app-button>
        </div>
      </div>
    </app-modal>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
    .animate-heartbeat {
      animation: heartbeat 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
    .animate-pulse-slow {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      50% { opacity: .6; }
    }
  `]
})
export class SessionDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private authService = inject(AuthService);
  
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
  isMetaModalOpen = signal(false);
  isArtifactModalOpen = signal(false);
  machineName = signal('');
  softwareVersion = signal('');
  availableVersions = signal<string[]>([]);
  
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

  isCaptureLocked = computed(() => {
    const status = this.session()?.status;
    return status === 'planned' || status === 'completed';
  });

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
    this.loadVersions();
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

  loadVersions() {
    this.api.getVersions().subscribe(versions => this.availableVersions.set(versions));
  }

  loadSession() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getSession(id).subscribe(session => {
      this.session.set(session);
      this.logs.set(session.logs);
      this.artifacts.set(session.artifacts);
      this.debriefSummary.set(session.debrief_summary || '');
      this.hasMoreLogs.set(false); 
      if (session.machine_name) this.machineName.set(session.machine_name);
      if (session.software_version) this.softwareVersion.set(session.software_version);
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

  openMetaModal() {
    this.machineName.set(this.session().machine_name || '');
    this.softwareVersion.set(this.session().software_version || '');
    this.isMetaModalOpen.set(true);
  }

  saveMetadata() {
    const id = this.session().id;
    const update: any = { 
      machine_name: this.machineName(),
      software_version: this.softwareVersion()
    };
    
    if (this.session().status === 'planned') {
      update.status = 'in-progress';
    }

    this.api.updateSession(id, update).subscribe(updated => {
      this.isMetaModalOpen.set(false);
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
    if (!this.logEntry() || this.isSubmittingLog() || this.isCaptureLocked()) return;
    
    this.isSubmittingLog.set(true);
    this.api.createLog({
      session_id: this.session().id,
      content: this.logEntry(),
      category: this.logCategory(),
      author: this.authService.currentUser()?.username || 'tester',
      artifact_ids: this.selectedArtifacts().map(a => a.id)
    }).subscribe({
      next: (newLog) => {
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
      default: return 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white border border-black dark:border-white';
    }
  }
}
