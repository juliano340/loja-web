import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <h1 class="mb-4 text-lg font-semibold">Login</h1>

        @if (success) {
        <div class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Conta criada com sucesso. Agora entre com seu email e senha.
        </div>
        }

        <form class="form" (ngSubmit)="submit()" #form="ngForm">
          <input
            class="input"
            type="email"
            placeholder="Email"
            [(ngModel)]="email"
            name="email"
            required
          />

          <input
            class="input"
            type="password"
            placeholder="Senha"
            [(ngModel)]="password"
            name="password"
            required
          />

          @if (error) {
          <p class="text-sm text-red-600">{{ error }}</p>
          }

          <button class="btn-primary" type="submit" [disabled]="!form.valid || loading">
            @if (loading) { Entrando... } @else { Entrar }
          </button>
        </form>

        <p class="mt-4 text-sm text-center text-gray-600">
          Não tem conta?
          <a routerLink="/register" class="text-blue-600 hover:underline font-medium">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  error = '';
  success = false;
  loading = false;

  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.success = this.route.snapshot.queryParamMap.get('registered') === '1';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  submit() {
    if (this.loading) return;

    this.error = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.loading = false;
        this.error = 'Email ou senha inválidos';
      },
    });
  }
}
