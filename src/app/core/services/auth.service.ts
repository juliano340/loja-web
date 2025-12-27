import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000';

  private readonly _token = signal<string | null>(localStorage.getItem('token'));

  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());

  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient) {}
  loadMe() {
    return this.http.get<User>('http://localhost:3000/users/me').subscribe({
      next: (user) => this._user.set(user),
      error: () => this.logout(),
    });
  }

  login(email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          this._token.set(res.access_token);
          localStorage.setItem('token', res.access_token);
          this.loadMe();
        })
      );
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/users`, { name, email, password })
      .pipe(
        tap((res) => {
          this._token.set(res.access_token);
          localStorage.setItem('token', res.access_token);
          this.loadMe();
        })
      );
  }

  logout() {
    this._token.set(null);
    localStorage.removeItem('token');
  }
}
