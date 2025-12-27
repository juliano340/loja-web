import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule], // ✅ APENAS o que o template usa
  template: `
    <h1>Login</h1>

    <form (ngSubmit)="submit()" #form="ngForm">
      <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required />

      <input type="password" placeholder="Senha" [(ngModel)]="password" name="password" required />

      @if (error) {
      <p style="color:red">{{ error }}</p>
      }

      <button type="submit" [disabled]="!form.valid">Entrar</button>
    </form>
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
