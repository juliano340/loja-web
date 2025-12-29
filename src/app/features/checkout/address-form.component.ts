import { Component, HostListener, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckoutService, Address } from './checkout.service';
import { HttpClient } from '@angular/common/http';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

@Component({
  standalone: true,
  selector: 'app-address-form',
  imports: [FormsModule],
  template: `
    <div>
      <h2 class="text-lg font-semibold text-gray-900">Endereço</h2>
    </div>

    @if (cepError) {
    <div
      class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      {{ cepError }}
    </div>
    }

    <form class="form mt-5" (ngSubmit)="submit()" #form="ngForm">
      <!-- Nome (opcional) -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">
          Nome completo <span class="text-xs text-gray-500 font-normal">(opcional)</span>
        </label>
        <input
          class="input"
          type="text"
          [(ngModel)]="model.name"
          name="name"
          (ngModelChange)="touched = true"
          autocomplete="name"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- CEP -->
        <div class="space-y-2 sm:col-span-1">
          <label class="text-sm font-medium text-gray-700">
            CEP <span class="text-blue-600">*</span>
          </label>

          <div class="relative">
            <input
              class="input pr-10"
              type="text"
              [(ngModel)]="model.zip"
              name="zip"
              required
              minlength="5"
              maxlength="10"
              (ngModelChange)="onZipChange($event)"
              (blur)="formatZip()"
              autocomplete="postal-code"
              inputmode="numeric"
            />

            @if (cepLoading) {
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">…</span>
            }
          </div>

          @if (form.submitted && !form.controls['zip']?.valid) {
          <p class="text-xs text-red-600">Informe um CEP válido.</p>
          }
        </div>

        <!-- UF -->
        <div class="space-y-2 sm:col-span-1">
          <label class="text-sm font-medium text-gray-700">
            UF <span class="text-blue-600">*</span>
          </label>
          <input
            class="input"
            type="text"
            [(ngModel)]="model.state"
            name="state"
            required
            minlength="2"
            maxlength="2"
            (blur)="formatState(); markManual('state')"
            (ngModelChange)="touched = true"
            autocomplete="address-level1"
            autocapitalize="characters"
          />
          @if (form.submitted && !form.controls['state']?.valid) {
          <p class="text-xs text-red-600">Informe a UF.</p>
          }
        </div>

        <!-- Cidade -->
        <div class="space-y-2 sm:col-span-1">
          <label class="text-sm font-medium text-gray-700">
            Cidade <span class="text-blue-600">*</span>
          </label>
          <input
            class="input"
            type="text"
            [(ngModel)]="model.city"
            name="city"
            required
            minlength="2"
            maxlength="50"
            (blur)="markManual('city')"
            (ngModelChange)="touched = true"
            autocomplete="address-level2"
          />
          @if (form.submitted && !form.controls['city']?.valid) {
          <p class="text-xs text-red-600">Informe a cidade.</p>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Rua -->
        <div class="space-y-2 sm:col-span-2">
          <label class="text-sm font-medium text-gray-700">
            Rua <span class="text-blue-600">*</span>
          </label>
          <input
            class="input"
            type="text"
            [(ngModel)]="model.street"
            name="street"
            required
            minlength="3"
            maxlength="100"
            (blur)="markManual('street')"
            (ngModelChange)="touched = true"
            autocomplete="address-line1"
          />
          @if (form.submitted && !form.controls['street']?.valid) {
          <p class="text-xs text-red-600">Informe a rua.</p>
          }
        </div>

        <!-- Número -->
        <div class="space-y-2 sm:col-span-1">
          <label class="text-sm font-medium text-gray-700">
            Número <span class="text-blue-600">*</span>
          </label>
          <input
            class="input"
            type="text"
            [(ngModel)]="model.number"
            name="number"
            required
            minlength="1"
            maxlength="20"
            (ngModelChange)="touched = true"
            autocomplete="address-line2"
          />
          @if (form.submitted && !form.controls['number']?.valid) {
          <p class="text-xs text-red-600">Informe o número.</p>
          }
        </div>
      </div>

      <!-- Complemento (opcional) -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">
          Complemento <span class="text-xs text-gray-500 font-normal">(opcional)</span>
        </label>
        <input
          class="input"
          type="text"
          [(ngModel)]="model.complement"
          name="complement"
          minlength="1"
          maxlength="100"
          (ngModelChange)="touched = true"
          autocomplete="off"
        />
      </div>

      <div class="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
        <button class="btn-primary sm:w-auto" type="submit" [disabled]="!form.valid">
          Continuar para pagamento
        </button>

        <button
          type="button"
          (click)="openClearConfirm()"
          class="sm:w-auto px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
        >
          Limpar endereço
        </button>

        <span class="text-xs text-gray-500 sm:ml-auto">
          <span class="text-blue-600">*</span> obrigatórios
        </span>
      </div>
    </form>

    <!-- MODAL PREMIUM (reutilizado) -->
    @if (confirmOpen) {
    <div
      class="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmação"
    >
      <div class="absolute inset-0 bg-black/40" (click)="closeConfirm()"></div>

      <div
        class="relative w-full max-w-sm rounded-xl bg-white border border-gray-200 shadow-xl p-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="text-base font-semibold text-gray-900">{{ confirmTitle }}</h2>
            <p class="text-sm text-gray-600 mt-1">{{ confirmMessage }}</p>
          </div>

          <button
            type="button"
            class="text-gray-500 hover:text-gray-700 transition"
            (click)="closeConfirm()"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <div class="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            class="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
            (click)="closeConfirm()"
          >
            Cancelar
          </button>

          <button
            type="button"
            class="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
            (click)="confirmClearAddress()"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
    }
  `,
})
export class AddressFormComponent implements OnDestroy {
  touched = false;

  model: Address = {
    name: '',
    zip: '',
    street: '',
    number: '',
    city: '',
    state: '',
    complement: '',
  };

  cepLoading = false;
  cepError = '';

  private manual = {
    street: false,
    city: false,
    state: false,
  };

  private zip$ = new Subject<string>();
  private sub: Subscription;

  // ✅ modal premium
  confirmOpen = false;
  confirmTitle = 'Limpar endereço?';
  confirmMessage = 'Isso removerá o endereço preenchido deste checkout.';

  private bodyLocked = false;
  private prevBodyOverflow = '';
  private prevBodyPaddingRight = '';

  constructor(private checkout: CheckoutService, private http: HttpClient) {
    const existing = this.checkout.address();
    if (existing) this.model = { ...existing };

    this.sub = this.zip$.pipe(debounceTime(350), distinctUntilChanged()).subscribe((zipDigits) => {
      this.lookupCep(zipDigits);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.unlockBodyScroll();
  }

  markManual(field: 'street' | 'city' | 'state') {
    this.manual[field] = true;
  }

  onZipChange(value: string) {
    this.touched = true;
    this.cepError = '';

    const digits = String(value ?? '').replace(/\D/g, '');

    if (digits.length === 8) {
      this.zip$.next(digits);
    } else {
      this.cepLoading = false;
    }
  }

  formatZip() {
    const digits = (this.model.zip ?? '').replace(/\D/g, '');
    if (digits.length === 8) {
      this.model.zip = `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
      return;
    }
    this.model.zip = (this.model.zip ?? '').trim();
  }

  formatState() {
    this.model.state = (this.model.state ?? '').trim().toUpperCase().slice(0, 2);
  }

  private lookupCep(zipDigits: string) {
    this.cepLoading = true;
    this.cepError = '';

    this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${zipDigits}/json/`).subscribe({
      next: (res) => {
        this.cepLoading = false;

        if (!res || res.erro) {
          this.cepError = 'CEP não encontrado.';
          return;
        }

        const street = (res.logradouro ?? '').trim();
        const city = (res.localidade ?? '').trim();
        const state = (res.uf ?? '').trim().toUpperCase();

        if (street && !this.manual.street) this.model.street = street;
        if (city && !this.manual.city) this.model.city = city;
        if (state && !this.manual.state) this.model.state = state;

        if (res.cep) this.model.zip = res.cep;

        const comp = (res.complemento ?? '').trim();
        if (comp && !String(this.model.complement ?? '').trim()) {
          this.model.complement = comp;
        }
      },
      error: () => {
        this.cepLoading = false;
        this.cepError = 'Não foi possível consultar o CEP.';
      },
    });
  }

  submit() {
    const address: Address = {
      name: (this.model.name ?? '').trim() || undefined,
      zip: (this.model.zip ?? '').trim(),
      street: (this.model.street ?? '').trim(),
      number: (this.model.number ?? '').trim(),
      city: (this.model.city ?? '').trim(),
      state: (this.model.state ?? '').trim().toUpperCase(),
      complement: (this.model.complement ?? '').trim() || undefined,
    };

    this.checkout.address.set(address);
    this.checkout.nextStep();
  }

  // ✅ modal actions
  openClearConfirm() {
    this.confirmOpen = true;
    this.lockBodyScroll();
  }

  closeConfirm() {
    this.confirmOpen = false;
    this.unlockBodyScroll();
  }

  confirmClearAddress() {
    this.clearAddress();
    this.closeConfirm();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.confirmOpen) this.closeConfirm();
  }

  clearAddress() {
    // limpa estado persistido no checkout (e no localStorage, se você implementou no service)
    this.checkout.clearAddress();

    // reseta o form local
    this.model = {
      name: '',
      zip: '',
      street: '',
      number: '',
      city: '',
      state: '',
      complement: '',
    };

    this.manual = { street: false, city: false, state: false };
    this.cepError = '';
    this.cepLoading = false;
    this.touched = false;
  }

  private lockBodyScroll(): void {
    if (this.bodyLocked) return;

    const body = document.body;
    const docEl = document.documentElement;

    this.prevBodyOverflow = body.style.overflow;
    this.prevBodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - docEl.clientWidth;
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = 'hidden';
    this.bodyLocked = true;
  }

  private unlockBodyScroll(): void {
    if (!this.bodyLocked) return;

    const body = document.body;
    body.style.overflow = this.prevBodyOverflow;
    body.style.paddingRight = this.prevBodyPaddingRight;

    this.bodyLocked = false;
  }
}
