import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { ButtonComponent } from '../../components/button/button';
import { ModalComponent } from '../../components/modal/modal';
import { InputComponent } from '../../components/input/input';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, InputComponent],
  template: `
    <div class="h-full flex flex-col overflow-hidden px-2 sm:px-6 py-6 animate-in fade-in duration-700 ease-out">
      <div class="flex-shrink-0 flex flex-col lg:flex-row justify-between items-end gap-6 border-b-2 border-black dark:border-white pb-6 mb-8">
        <div class="flex-grow">
          <h2 class="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Operator Registry</h2>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-2">System Access Control</p>
        </div>
        
        <div class="flex items-end gap-4">
          <app-button class="h-9 whitespace-nowrap active:scale-95 transition-transform" (onClick)="openCreateModal()">+ Add New Operator</app-button>
        </div>
      </div>

      <div class="flex-grow overflow-y-auto custom-scrollbar border-2 border-black dark:border-white bg-white dark:bg-gray-900">
        <table class="w-full border-collapse text-sm">
          <thead class="sticky top-0 z-20">
            <tr class="bg-black text-white dark:bg-white dark:text-black">
              <th class="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Username</th>
              <th class="px-4 py-2 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Email</th>
              <th class="px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Role</th>
              <th class="px-4 py-2 text-center text-[10px] font-black uppercase tracking-widest border-r border-white/20 dark:border-black/20">Status</th>
              <th class="px-4 py-2 text-right text-[10px] font-black uppercase tracking-widest">Joined</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-black/10 dark:divide-white/10">
            @for (user of users(); track user.id) {
              <tr class="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td class="px-4 py-3 font-mono font-bold">{{ user.username }}</td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ user.email }}</td>
                <td class="px-4 py-3 text-center">
                  @if (user.is_admin) {
                    <span class="px-1.5 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[9px] font-black uppercase ring-1 ring-blue-500/20">Admin</span>
                  } @else {
                    <span class="px-1.5 py-0.5 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 text-[9px] font-black uppercase ring-1 ring-gray-500/20">Operator</span>
                  }
                </td>
                <td class="px-4 py-3 text-center">
                  @if (user.must_change_password) {
                    <span class="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-[9px] font-black uppercase italic ring-1 ring-yellow-500/20">Pending Setup</span>
                  } @else {
                    <span class="px-1.5 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-[9px] font-black uppercase ring-1 ring-green-500/20">Active</span>
                  }
                </td>
                <td class="px-4 py-3 text-right text-[10px] font-mono text-gray-400">{{ user.created_at | date:'yyyy-MM-dd' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create User Modal -->
      <app-modal [isOpen]="isModalOpen()" title="Provision New Operator" (close)="isModalOpen.set(false)">
        <div class="space-y-4">
          <app-input 
            label="Username" 
            placeholder="OPERATOR_NAME" 
            [value]="newUser().username"
            (valueChange)="updateNewUser('username', $event)"
          />
          <app-input 
            label="System Email" 
            type="email"
            placeholder="operator@system.internal" 
            [value]="newUser().email"
            (valueChange)="updateNewUser('email', $event)"
          />
          <app-input 
            label="Initial Access Key" 
            type="password"
            placeholder="••••••••" 
            [value]="newUser().password"
            (valueChange)="updateNewUser('password', $event)"
          />
          
          <div class="flex items-center gap-2 px-1">
            <input 
              type="checkbox" 
              id="is_admin" 
              [checked]="newUser().is_admin"
              (change)="toggleAdmin($event)"
              class="w-4 h-4 accent-black dark:accent-white"
            >
            <label for="is_admin" class="text-[10px] font-black uppercase tracking-widest text-gray-500">Elevate to System Administrator</label>
          </div>
        </div>
        
        <div footer class="flex justify-end gap-3">
          <app-button variant="secondary" (onClick)="isModalOpen.set(false)">Abort</app-button>
          <app-button [disabled]="!isValid()" (onClick)="createUser()">Establish Record</app-button>
        </div>
      </app-modal>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  users = signal<any[]>([]);
  isModalOpen = signal(false);
  
  newUser = signal({
    username: '',
    email: '',
    password: '',
    is_admin: false
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getUsers().subscribe(users => this.users.set(users));
  }

  openCreateModal() {
    this.newUser.set({ username: '', email: '', password: '', is_admin: false });
    this.isModalOpen.set(true);
  }

  updateNewUser(field: string, value: string) {
    this.newUser.update(u => ({ ...u, [field]: value }));
  }

  toggleAdmin(event: any) {
    this.newUser.update(u => ({ ...u, is_admin: event.target.checked }));
  }

  isValid() {
    const u = this.newUser();
    return u.username && u.email && u.password;
  }

  createUser() {
    this.api.createOperator(this.newUser()).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => alert(err.error?.error || 'Provisioning failed')
    });
  }
}
