import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="w-full max-w-2xl space-y-6">
        <!-- Topbar -->
        <header class="flex items-start justify-between gap-4">
          <div>
            <a routerLink="/profile" class="text-sm text-gray-600 hover:text-gray-900">
              ← Voltar para perfil
            </a>
            <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900 mt-2">Trocar senha</h1>
            <p class="text-sm text-gray-500 mt-1">
              Para sua segurança, confirme a senha atual e defina uma nova senha.
            </p>
          </div>
        </header>

        <div class="card max-w-2xl">
          <h2 class="text-lg font-semibold text-gray-900">Segurança da conta</h2>
          <p class="text-sm text-gray-500 mt-1">Use uma senha com pelo menos 6 caracteres.</p>

          <!-- Alerts -->
          @if (success) {
          <div
            class="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            Senha atualizada com sucesso!
          </div>
          } @if (error) {
          <div
            class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {{ error }}
          </div>
          } @if (passwordMismatch) {
          <div
            class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            As senhas não conferem.
          </div>
          }

          <form class="form mt-5" (ngSubmit)="submit()" #form="ngForm">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Senha atual</label>
              <input
                class="input"
                type="password"
                placeholder="Digite sua senha atual"
                [(ngModel)]="currentPassword"
                (ngModelChange)="onChange()"
                name="currentPassword"
                required
                autocomplete="current-password"
              />
              @if (form.submitted && !form.controls['currentPassword']?.valid) {
              <p class="text-xs text-red-600">Informe sua senha atual.</p>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Nova senha</label>
              <input
                class="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                [(ngModel)]="newPassword"
                (ngModelChange)="onChange()"
                name="newPassword"
                required
                minlength="6"
                autocomplete="new-password"
              />
              @if (form.submitted && !form.controls['newPassword']?.valid) {
              <p class="text-xs text-red-600">A nova senha deve ter pelo menos 6 caracteres.</p>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Confirmar nova senha</label>
              <input
                class="input"
                type="password"
                placeholder="Repita a nova senha"
                [(ngModel)]="confirmPassword"
                (ngModelChange)="onChange()"
                name="confirmPassword"
                required
                autocomplete="new-password"
              />
              @if (form.submitted && !form.controls['confirmPassword']?.valid) {
              <p class="text-xs text-red-600">Confirme a nova senha.</p>
              }
            </div>

            <div class="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="submit"
                class="btn-primary sm:w-auto"
                [disabled]="!form.valid || passwordMismatch || loading"
              >
                @if (loading) { Alterando... } @else { Alterar senha }
              </button>

              <a routerLink="/profile" class="btn-secondary sm:w-auto text-center"> Cancelar </a>

              <span class="text-xs text-gray-500 sm:ml-auto">
                Dica: evite reutilizar senhas antigas.
              </span>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class ChangePasswordPage {
  private auth = inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  success = false;
  error = '';
  loading = false;

  get passwordMismatch(): boolean {
    return (
      !!this.newPassword && !!this.confirmPassword && this.newPassword !== this.confirmPassword
    );
  }

  onChange() {
    // quando o usuário mexe, limpa feedback antigo
    this.success = false;
    this.error = '';
  }

  submit() {
    this.success = false;
    this.error = '';

    if (this.passwordMismatch) return;

    this.loading = true;

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
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;

          const status = err?.status;
          const msg = err?.error?.message;

          // message pode ser string ou string[]
          const apiMessage = Array.isArray(msg)
            ? msg.filter(Boolean).join(', ')
            : typeof msg === 'string'
            ? msg
            : '';

          if (status === 401 && apiMessage) {
            this.error = apiMessage; // "Senha atual inválida"
            return;
          }

          if (apiMessage) {
            this.error = apiMessage;
            return;
          }

          this.error = 'Não foi possível alterar a senha. Tente novamente.';
        },
      });
  }
}
