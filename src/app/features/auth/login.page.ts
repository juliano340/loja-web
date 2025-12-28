import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink], // ✅ APENAS o que o template usa
  template: `
    <div class="page">
      <div class="card">
        <h1 class="mb-4 text-lg font-semibold">Login</h1>

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

          <button class="btn-primary" type="submit" [disabled]="!form.valid">Entrar</button>
        </form>

        <!-- 🔗 LINK PARA CADASTRO -->
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
export class LoginPage {
  email = '';
  password = '';
  error = '';

  private auth = inject(AuthService);
  private router = inject(Router);

  submit() {
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/products']),
      error: () => {
        this.error = 'Email ou senha inválidos';
      },
    });
  }
}
