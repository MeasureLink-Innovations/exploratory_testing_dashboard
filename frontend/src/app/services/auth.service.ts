import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  must_change_password: boolean;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/auth';
  private tokenKey = 'etd_auth_token';
  private userKey = 'etd_auth_user';

  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => !!this.currentUser()?.is_admin);
  mustChangePassword = computed(() => !!this.currentUser()?.must_change_password);

  login(credentials: { identifier: string; password: any }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  setupAccount(data: { username: string; email: string; password: any }): Observable<AuthResponse> {
    return this.http.patch<AuthResponse>(`${this.apiUrl}/setup-account`, data).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
    this.currentUser.set(response.user);
  }

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
