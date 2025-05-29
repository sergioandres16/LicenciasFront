import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  nombre: string;
  correo: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  login(usernameOrEmail: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<AuthResponse>(url, { usernameOrEmail, password }).pipe(
      tap(res => {
        this.setToken(res.token);
        sessionStorage.setItem('nombre', res.nombre);
        sessionStorage.setItem('correo', res.correo);
      })
    );
  }

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    const url = `${this.apiUrl}/auth/register`;
    return this.http.post<AuthResponse>(url, { username, email, password });
  }

  validateToken(token: string): Observable<boolean> {
    const url = `${this.apiUrl}/auth/validate`;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  setToken(token: string): void {
    sessionStorage.setItem('token', token);
  }

  getToken(): string | null {
    return sessionStorage.getItem('token');
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nombre');
    sessionStorage.removeItem('correo');
  }
}
