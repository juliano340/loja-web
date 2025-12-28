import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="w-full max-w-2xl space-y-6">
        <!-- Header da página -->
        <header class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-semibold text-gray-900">Meu perfil</h1>
            <p class="text-sm text-gray-500 mt-1">
              Atualize seus dados de conta. As alterações valem para seus próximos pedidos.
            </p>
          </div>

          <a
            routerLink="/profile/password"
            class="hidden sm:inline-flex px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
          >
            Alterar senha
          </a>
        </header>

        <!-- Loading -->
        @if (!auth.user()) {
        <div class="card">
          <div class="space-y-3">
            <div class="h-5 w-40 bg-gray-100 rounded"></div>
            <div class="h-10 w-full bg-gray-100 rounded"></div>
            <div class="h-10 w-full bg-gray-100 rounded"></div>
            <div class="h-10 w-44 bg-gray-100 rounded"></div>
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

            <span class="text-xs text-gray-500"> ID: {{ auth.user()?.id ?? '—' }} </span>
          </div>

          <!-- Alert sucesso -->
          @if (success) {
          <div
            class="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            Perfil atualizado com sucesso!
          </div>
          }

          <form class="form mt-5" (ngSubmit)="save()" #form="ngForm">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Nome</label>
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
              @if (form.submitted && !form.controls['name']?.valid) {
              <p class="text-xs text-red-600">Informe um nome com pelo menos 3 caracteres.</p>
              }
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">E-mail</label>
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
              @if (form.submitted && !form.controls['email']?.valid) {
              <p class="text-xs text-red-600">Informe um e-mail válido.</p>
              }
            </div>

            <div class="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                type="submit"
                class="btn-primary sm:w-auto"
                [disabled]="!form.valid || !hasChanges"
              >
                Salvar alterações
              </button>

              <a routerLink="/profile/password" class="btn-secondary sm:w-auto text-center">
                Alterar senha
              </a>

              @if (!hasChanges) {
              <span class="text-xs text-gray-500 sm:ml-auto"> Nenhuma alteração pendente. </span>
              }
            </div>
          </form>
        </div>

        <!-- Card extra opcional (padrão premium) -->
        <div class="bg-white border border-gray-200 rounded-lg p-6">
          <h3 class="text-sm font-semibold text-gray-900">Segurança</h3>
          <p class="text-sm text-gray-500 mt-1">Recomendamos trocar sua senha periodicamente.</p>
          <div class="mt-4">
            <a
              routerLink="/profile/password"
              class="inline-flex px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-black transition"
            >
              Ir para alteração de senha
            </a>
          </div>
        </div>
        }
      </div>
    </section>
  `,
})
export class ProfilePage implements OnInit {
  auth = inject(AuthService);

  name = '';
  email = '';

  private initialName = '';
  private initialEmail = '';

  success = false;
  hasChanges = false;

  ngOnInit() {
    const user = this.auth.user();
    if (user) {
      this.name = user.name;
      this.email = user.email;

      this.initialName = user.name;
      this.initialEmail = user.email;

      this.hasChanges = false;
    }
  }

  onChange() {
    this.success = false;
    this.hasChanges =
      this.name.trim() !== this.initialName.trim() ||
      this.email.trim().toLowerCase() !== this.initialEmail.trim().toLowerCase();
  }

  save() {
    this.success = false;

    // se nada mudou, não faz nada
    if (!this.hasChanges) return;

    this.auth.updateMe({
      name: this.name.trim(),
      email: this.email.trim(),
    });

    // como hoje você não está esperando retorno async, marcamos sucesso aqui.
    // se updateMe for Observable/Promise, eu ajusto pra marcar sucesso só no "next".
    this.initialName = this.name.trim();
    this.initialEmail = this.email.trim();
    this.hasChanges = false;

    this.success = true;
  }
}
