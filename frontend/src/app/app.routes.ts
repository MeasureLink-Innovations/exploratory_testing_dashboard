import { Routes } from '@angular/router';
import { SessionListComponent } from './pages/session-list/session-list';
import { SessionDetailComponent } from './pages/session-detail/session-detail';

export const routes: Routes = [
  { path: '', redirectTo: 'sessions', pathMatch: 'full' },
  { path: 'sessions', component: SessionListComponent },
  { path: 'sessions/:id', component: SessionDetailComponent },
];
