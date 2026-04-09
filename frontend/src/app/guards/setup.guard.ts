import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const setupGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    // Redirect unauthenticated users to login
    router.navigate(['/login']);
    return false;
  }

  if (!authService.mustChangePassword()) {
    // If must_change_password is false, redirect them away from setup
    router.navigate(['/sessions']); 
    return false;
  }

  // User is authenticated and must change password
  return true;
};
