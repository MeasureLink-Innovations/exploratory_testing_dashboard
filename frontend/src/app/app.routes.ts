import { Routes } from '@angular/router';
import { SessionListComponent } from './pages/session-list/session-list';
import { SessionDetailComponent } from './pages/session-detail/session-detail';
import { LoginComponent } from './pages/login/login';
import { AccountSetupComponent } from './pages/setup-account/setup-account';
import { AdminDashboardComponent } from './pages/admin/admin';
import { VersionsComponent } from './pages/versions/versions';
import { authGuard } from './guards/auth.guard';
import { setupGuard } from './guards/setup.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'sessions', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'setup-account', 
    component: AccountSetupComponent,
    canActivate: [setupGuard]
  },
  { 
    path: 'admin', 
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'versions', 
    component: VersionsComponent,
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'sessions', 
    component: SessionListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'sessions/:id', 
    component: SessionDetailComponent,
    canActivate: [authGuard]
  },
];
