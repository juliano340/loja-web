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
  private readonly apiUrl = '/api';

  private readonly _token = signal<string | null>(localStorage.getItem('token'));

  readonly token = this._token.asReadonly();

  readonly isAuthenticated = computed(() => !!this._token());

  private readonly _user = signal<User | null>(null);

  readonly user = this._user.asReadonly();

  private readonly _loadingUser = signal(false);
  readonly loadingUser = this._loadingUser.asReadonly();

  constructor(private http: HttpClient) {}

  loadMe() {
    this._loadingUser.set(true);

    return this.http.get<User>('/api/users/me').subscribe({
      next: (user) => {
        this._user.set(user);
        this._loadingUser.set(false);
      },
      error: () => {
        this.logout();
        this._loadingUser.set(false);
      },
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
    return this.http.post(`${this.apiUrl}/users`, { name, email, password });
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('token');
  }

  updateMe(data: { name: string; email: string }) {
    return this.http.patch<User>('/api/users/me', data).subscribe({
      next: (user) => {
        this._user.set(user);
      },
    });
  }
  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.patch('/api/users/me/password', data);
  }
}
