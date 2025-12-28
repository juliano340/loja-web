import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckoutService } from './checkout.service';

@Component({
  standalone: true,
  selector: 'app-address-form',
  imports: [FormsModule],
  template: `
    <h2 class="text-lg font-medium mb-4">Endereço</h2>

    <form class="form" (ngSubmit)="submit()">
      <input class="input" placeholder="Nome completo" required />

      <input class="input" placeholder="CEP" required />

      <input class="input" placeholder="Rua" required />

      <input class="input" placeholder="Número" required />

      <input class="input" placeholder="Complemento (opcional)" />

      <input class="input" placeholder="Cidade" required />

      <input class="input" placeholder="Estado" required />

      <button class="btn-primary" type="submit">Continuar para pagamento</button>
    </form>
  `,
})
export class AddressFormComponent {
  constructor(private checkout: CheckoutService) {}

  submit() {
    this.checkout.address.set({
      name: 'Cliente Teste',
      cep: '00000-000',
      street: 'Rua Exemplo',
      number: '123',
      city: 'Cidade',
      state: 'UF',
    });

    this.checkout.nextStep();
  }
}
