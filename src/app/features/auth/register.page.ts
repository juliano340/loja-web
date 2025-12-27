import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule],
  template: `
    <h1>Criar conta</h1>

    <form (ngSubmit)="submit()" #form="ngForm">
      <input type="text" placeholder="Nome" [(ngModel)]="name" name="name" required minlength="3" />

      <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required email />

      <input
        type="password"
        placeholder="Senha"
        [(ngModel)]="password"
        name="password"
        required
        minlength="6"
      />

      <input
        type="password"
        placeholder="Confirmar senha"
        [(ngModel)]="confirmPassword"
        name="confirmPassword"
        required
      />

      @if (password && confirmPassword && password !== confirmPassword) {
      <p style="color:red">As senhas não conferem</p>
      }

      <button type="submit" [disabled]="!form.valid || password !== confirmPassword">
        Cadastrar
      </button>
    </form>
  `,
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';

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
