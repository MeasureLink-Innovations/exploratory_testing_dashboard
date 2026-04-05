import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PaginatedResponse<T> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface SessionsResponse extends PaginatedResponse<any> {
  sessions: any[];
}

export interface LogsResponse extends PaginatedResponse<any> {
  logs: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  // Sessions
  getSessions(search?: string, limit = 20, offset = 0, sortBy = 'created_at', sortOrder = 'DESC', versionFilter?: string): Observable<SessionsResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);
    
    if (search) {
      params = params.set('search', search);
    }
    if (versionFilter) {
      params = params.set('versionFilter', versionFilter);
    }
    return this.http.get<SessionsResponse>(`${this.apiUrl}/sessions`, { params });
  }

  getVersions(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/sessions/versions`);
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

  getLogs(sessionId: number, limit = 50, offset = 0): Observable<LogsResponse> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<LogsResponse>(`${this.apiUrl}/logs/session/${sessionId}`, { params });
  }

  linkArtifactsToLog(logId: number, artifactIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logs/${logId}/artifacts`, { artifact_ids: artifactIds });
  }

  // Artifacts
  uploadArtifact(formData: FormData): Observable<any[]> {
    return this.http.post<any[]>(`${this.apiUrl}/artifacts`, formData);
  }

  getArtifactUrl(id: number): string {
    return `${this.apiUrl}/artifacts/${id}`;
  }
}
