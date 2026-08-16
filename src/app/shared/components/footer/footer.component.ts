import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div class="md:col-span-2 max-w-sm">
          <a routerLink="/" class="footer-brand inline-flex items-center gap-2.5">
            <span
              class="flex items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white font-display font-black text-lg leading-none"
              style="width:34px;height:34px"
              >L</span
            >
            LOJA WEB
          </a>
          <p class="text-sm mt-3 leading-relaxed">
            Equipamentos de <span class="text-accent-400 font-semibold">fitness</span> e
            <span class="text-accent-400 font-semibold">fisioterapia</span> com preço justo, envio
            rápido e compra 100% segura.
          </p>
        </div>

        <div>
          <p class="footer-title">Navegação</p>
          <a routerLink="/products" class="footer-link">Produtos</a>
          <a routerLink="/cart" class="footer-link">Carrinho</a>
          <a routerLink="/orders" class="footer-link">Meus pedidos</a>
          <a routerLink="/profile" class="footer-link">Minha conta</a>
        </div>

        <div>
          <p class="footer-title">Pagamento</p>
          <p class="text-sm flex items-center gap-2">
            <span class="badge-accent inline-flex items-center gap-1 rounded-md bg-accent-500 text-ink-950 px-2 py-0.5 text-xs font-bold"
              >PIX</span
            >
            <span class="inline-flex items-center rounded-md bg-ink-800 px-2 py-0.5 text-xs font-bold text-white"
              >VISA</span
            >
            <span class="inline-flex items-center rounded-md bg-ink-800 px-2 py-0.5 text-xs font-bold text-white"
              >MASTER</span
            >
          </p>
          <p class="text-xs text-ink-500 mt-3 leading-relaxed">
            Compra protegida com criptografia e checkout via Stripe.
          </p>
        </div>
      </div>

      <div class="border-t border-ink-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>© {{ year }} Loja Web. Todos os direitos reservados.</p>
          <p>
            Feito com <span class="text-brand-500">⚡ energia</span> pra você treinar melhor.
          </p>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
