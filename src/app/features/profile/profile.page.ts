import { Component, OnDestroy, ViewChild, effect, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="w-full max-w-2xl space-y-6">
        <!-- Back link premium -->
        <a
          routerLink="/products"
          class="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          ← Voltar para produtos
        </a>

        <!-- Header -->
        <header>
          <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">Meu perfil</h1>
          <p class="text-sm text-gray-500 mt-1">
            Atualize seus dados de conta. As alterações valem para seus próximos pedidos.
          </p>
        </header>

        <!-- Loading (enquanto não temos name/email prontos) -->
        @if (!ready) {
        <div class="card">
          <div class="space-y-3">
            <div class="h-5 w-44 bg-gray-100 rounded"></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="h-10 w-full bg-gray-100 rounded"></div>
              <div class="h-10 w-full bg-gray-100 rounded"></div>
            </div>
            <div class="h-10 w-56 bg-gray-100 rounded"></div>
          </div>
        </div>
        } @else {
        <div class="card">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Dados da conta</h2>
              <p class="text-sm text-gray-500 mt-1">
                Confirme se está tudo certo para facilitar seu checkout.
              </p>
            </div>

            <span class="text-xs text-gray-500">ID: {{ auth.user()?.id ?? '—' }}</span>
          </div>

          <!-- ✅ Confirmação de sucesso (premium + auto-dismiss) -->
          @if (success) {
          <div
            class="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            role="status"
            aria-live="polite"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <span class="mt-[1px] text-green-700" aria-hidden="true">✓</span>
                <div class="min-w-0">
                  <p class="font-medium text-green-900">Alterações salvas com sucesso</p>
                  <p class="text-green-800/80 text-xs mt-0.5">
                    Seus dados foram atualizados e valerão para os próximos pedidos.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="shrink-0 text-sm font-medium text-green-900/70 hover:text-green-900 transition"
                (click)="dismissSuccess()"
                aria-label="Fechar confirmação"
              >
                Fechar
              </button>
            </div>
          </div>
          }

          <form class="mt-5 space-y-5" (ngSubmit)="save()" #profileForm="ngForm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">
                  Nome <span class="text-red-600">*</span>
                </label>

                <input
                  class="input"
                  type="text"
                  [(ngModel)]="name"
                  (ngModelChange)="onChange()"
                  name="name"
                  required
                  minlength="3"
                  autocomplete="name"
                  placeholder="Seu nome"
                />

                @if (profileForm.submitted && !profileForm.controls['name']?.valid) {
                <p class="text-xs text-red-600">Informe um nome com pelo menos 3 caracteres.</p>
                }
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700">
                  E-mail <span class="text-red-600">*</span>
                </label>

                <input
                  class="input"
                  type="email"
                  [(ngModel)]="email"
                  (ngModelChange)="onChange()"
                  name="email"
                  required
                  email
                  autocomplete="email"
                  placeholder="seuemail@exemplo.com"
                />

                @if (profileForm.submitted && !profileForm.controls['email']?.valid) {
                <p class="text-xs text-red-600">Informe um e-mail válido.</p>
                }
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="flex flex-wrap items-center gap-3">
                <!-- Salvar -->
                <button
                  type="submit"
                  class="inline-flex items-center justify-center h-10 px-4 rounded-md
                           bg-blue-600 text-white text-sm font-medium
                           hover:bg-blue-700 transition
                           disabled:opacity-60 disabled:cursor-not-allowed"
                  [disabled]="!profileForm.valid || !hasChanges || saving"
                >
                  @if (saving) { Salvando... } @else { Salvar }
                </button>

                <!-- Desfazer -->
                <button
                  type="button"
                  class="inline-flex items-center justify-center h-10 px-4 rounded-md
                           border border-gray-300 bg-white text-gray-900 text-sm font-medium
                           hover:bg-gray-50 transition
                           disabled:opacity-60 disabled:cursor-not-allowed"
                  (click)="discardChanges()"
                  [disabled]="!hasChanges || saving"
                >
                  Desfazer
                </button>

                <!-- Alterar senha -->
                <a
                  routerLink="/profile/password"
                  class="inline-flex items-center justify-center h-10 px-4 rounded-md
                           border border-gray-300 bg-white text-gray-900 text-sm font-medium
                           hover:bg-gray-50 transition"
                >
                  Alterar senha
                </a>
              </div>

              <span class="text-xs text-gray-500 sm:ml-auto">
                @if (!hasChanges) { Nenhuma alteração pendente. } @else { Alterações não salvas. }
              </span>
            </div>

            <p class="text-xs text-gray-500 leading-relaxed">
              Dica: use um e-mail válido para receber atualizações sobre seus pedidos.
            </p>
          </form>
        </div>
        }
      </div>
    </section>
  `,
})
export class ProfilePage implements OnDestroy {
  auth = inject(AuthService);

  @ViewChild('profileForm') profileForm?: NgForm;

  name = '';
  email = '';

  private initialName = '';
  private initialEmail = '';

  success = false;
  hasChanges = false;

  ready = false;

  private hydratedUserId: number | null = null;

  saving = false;

  private successTimer: number | null = null;

  constructor() {
    effect(() => {
      const u = this.auth.user();

      const name = (u?.name ?? '').trim();
      const email = (u?.email ?? '').trim();

      const hasEssentials = !!u && name.length > 0 && email.length > 0;
      this.ready = hasEssentials;

      if (!hasEssentials) return;

      // se o usuário já está editando, não sobrescreve
      if (this.hasChanges) return;

      // hidrata só quando trocar usuário (ou primeira vez)
      if (this.hydratedUserId === u!.id) return;

      this.name = name;
      this.email = email;

      this.initialName = name;
      this.initialEmail = email;

      this.hasChanges = false;
      this.dismissSuccess();
      this.saving = false;

      queueMicrotask(() => {
        this.profileForm?.resetForm({ name: this.name, email: this.email });
      });

      this.hydratedUserId = u!.id;
    });
  }

  ngOnDestroy(): void {
    if (this.successTimer != null) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

  private showSuccess() {
    this.success = true;

    if (this.successTimer != null) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }

    // auto-dismiss (premium)
    this.successTimer = window.setTimeout(() => {
      this.success = false;
      this.successTimer = null;
    }, 3500);
  }

  dismissSuccess() {
    this.success = false;

    if (this.successTimer != null) {
      window.clearTimeout(this.successTimer);
      this.successTimer = null;
    }
  }

  onChange() {
    this.dismissSuccess();

    const currentName = this.name.trim();
    const currentEmail = this.email.trim().toLowerCase();

    this.hasChanges =
      currentName !== (this.initialName ?? '').trim() ||
      currentEmail !== (this.initialEmail ?? '').trim().toLowerCase();
  }

  discardChanges() {
    this.name = this.initialName;
    this.email = this.initialEmail;

    this.hasChanges = false;
    this.dismissSuccess();

    this.profileForm?.resetForm({ name: this.name, email: this.email });
  }

  save() {
    this.dismissSuccess();

    if (!this.hasChanges) return;

    this.saving = true;

    // mantendo sync como você está usando hoje.
    this.auth.updateMe({
      name: this.name.trim(),
      email: this.email.trim(),
    });

    this.initialName = this.name.trim();
    this.initialEmail = this.email.trim();

    this.hasChanges = false;
    this.saving = false;

    this.profileForm?.resetForm({ name: this.initialName, email: this.initialEmail });

    // ✅ confirmação
    this.showSuccess();
  }
}
