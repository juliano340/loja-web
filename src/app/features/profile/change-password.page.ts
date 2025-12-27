import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Trocar senha</h1>

    <form (ngSubmit)="submit()" #form="ngForm">
      <input
        type="password"
        placeholder="Senha atual"
        [(ngModel)]="currentPassword"
        name="currentPassword"
        required
      />

      <input
        type="password"
        placeholder="Nova senha"
        [(ngModel)]="newPassword"
        name="newPassword"
        required
        minlength="6"
      />

      <input
        type="password"
        placeholder="Confirmar nova senha"
        [(ngModel)]="confirmPassword"
        name="confirmPassword"
        required
      />

      @if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      <p style="color:red">As senhas não conferem</p>
      } @if (success) {
      <p style="color: green">Senha atualizada com sucesso!</p>
      } @if (error) {
      <p style="color: red">{{ error }}</p>
      }

      <button type="submit" [disabled]="!form.valid || newPassword !== confirmPassword">
        Alterar senha
      </button>
    </form>
    <button>
      <a routerLink="/">Voltar</a>
    </button>
  `,
})
export class ChangePasswordPage {
  private auth = inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  success = false;
  error = '';

  submit() {
    this.success = false;
    this.error = '';

    if (this.newPassword !== this.confirmPassword) return;

    this.auth
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.success = true;
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },
        error: () => {
          this.error = 'Senha atual inválida';
        },
      });
  }
}
