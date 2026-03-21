import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Sessions
  getSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`);
  }

  getSession(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sessions/${id}`);
  }

  createSession(session: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sessions`, session);
  }

  updateSession(id: number, session: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/sessions/${id}`, session);
  }

  // Logs
  createLog(log: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logs`, log);
  }

  getLogs(sessionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs/session/${sessionId}`);
  }

  // Artifacts
  uploadArtifact(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/artifacts`, formData);
  }

  getArtifactUrl(id: number): string {
    return `${this.apiUrl}/artifacts/${id}`;
  }
}
