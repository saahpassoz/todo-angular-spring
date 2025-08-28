import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_BASE = 'http://localhost:8080/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    if (this.isBrowser()) {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('current_user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          this.tokenSubject.next(token);
          this.currentUserSubject.next(user);
        } catch (error) {
          this.clearStoredAuth();
        }
      }
    }
  }

  private clearStoredAuth(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('current_user');
    }
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getHttpOptions(): { headers: HttpHeaders } {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.tokenSubject.value;
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/login`, credentials, this.getHttpOptions())
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setAuthData(response.token, response.user);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => ({ 
            message: error.error?.message || 'Email ou senha inválidos' 
          }));
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/register`, userData, this.getHttpOptions())
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setAuthData(response.token, response.user);
          }
        }),
        catchError(error => {
          console.error('Register error:', error);
          return throwError(() => ({ 
            message: error.error?.message || 'Erro ao criar conta' 
          }));
        })
      );
  }

  private setAuthData(token: string, user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    const token = this.tokenSubject.value;
    
    if (token) {
      // Chamar API de logout se necessário
      this.http.post(`${this.API_BASE}/auth/logout`, {}, this.getAuthHeaders())
        .pipe(
          catchError(error => {
            console.warn('Logout API call failed:', error);
            return of(null);
          })
        )
        .subscribe();
    }
    
    this.clearStoredAuth();
  }

  isAuthenticated(): boolean {
    const token = this.tokenSubject.value;
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.isBrowser() ? localStorage.getItem('refresh_token') : null;
    
    if (!refreshToken) {
      return throwError(() => ({ message: 'No refresh token available' }));
    }

    return this.http.post<AuthResponse>(`${this.API_BASE}/auth/refresh`, 
      { refreshToken }, 
      this.getHttpOptions()
    ).pipe(
      tap(response => {
        if (response.token && response.user) {
          this.setAuthData(response.token, response.user);
          if (this.isBrowser() && response.refreshToken) {
            localStorage.setItem('refresh_token', response.refreshToken);
          }
        }
      }),
      catchError(error => {
        this.clearStoredAuth();
        return throwError(() => ({ message: 'Token refresh failed' }));
      })
    );
  }

  // Método para verificar a saúde da API
  checkApiHealth(): Observable<boolean> {
    return this.http.get(`${this.API_BASE}/health`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}

