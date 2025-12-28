import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="card">
        <h1 class="mb-4 text-lg font-semibold">Criar conta</h1>

        <form class="form" (ngSubmit)="submit()" #form="ngForm">
          <input
            class="input"
            type="text"
            placeholder="Nome"
            [(ngModel)]="name"
            name="name"
            required
            minlength="3"
          />

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
            minlength="6"
          />

          <input
            class="input"
            type="password"
            placeholder="Confirmar senha"
            [(ngModel)]="confirmPassword"
            name="confirmPassword"
            required
          />

          @if (password && confirmPassword && password !== confirmPassword) {
          <p class="text-sm text-red-600">As senhas não conferem</p>
          } @if (error) {
          <p class="text-sm text-red-600">
            {{ error }}
          </p>
          }

          <button
            class="btn-primary"
            type="submit"
            [disabled]="!form.valid || password !== confirmPassword"
          >
            Cadastrar
          </button>
        </form>

        <!-- 🔗 LINK PARA LOGIN -->
        <p class="mt-4 text-sm text-center text-gray-600">
          Já tem conta?
          <a routerLink="/login" class="text-blue-600 hover:underline font-medium"> Fazer login </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (this.password !== this.confirmPassword) return;

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        alert('Cadastro realizado! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao cadastrar');
      },
    });
  }
}
