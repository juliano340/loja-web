import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ProductsService, Product } from '../../core/services/products.service';
import { CategoriesService, Category } from '../../core/services/categories.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, ProductCardComponent],
  template: `
    <!-- HERO -->
    <section class="relative overflow-hidden bg-ink-950 text-white">
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(132,204,22,0.22),transparent_50%)]"
        aria-hidden="true"
      ></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p class="section-kicker !text-accent-400">Fitness & Fisioterapia</p>
          <h1 class="font-display font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mt-3">
            TREINE PESADO,<br />
            <span class="text-brand-500">RECUPERE RÁPIDO.</span>
          </h1>
          <p class="mt-5 text-ink-300 text-lg leading-relaxed max-w-md">
            Equipamentos selecionados pra você manter a constância — do treino de força à
            fisioterapia.
          </p>

          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <a routerLink="/products" class="btn-accent !px-7 !py-3 !text-base"> Ver produtos </a>
            <a routerLink="/products" class="btn !px-7 !py-3 !text-base bg-white/10 text-white hover:bg-white/20 border border-white/20">
              Explorar categorias
            </a>
          </div>

          <div class="mt-10 flex items-center gap-6 text-sm">
            <div class="flex -space-x-2" aria-hidden="true">
              @for (dot of heroDots; track $index) {
              <span
                class="inline-block rounded-full border-2 border-ink-950"
                [style.background]="dot"
                style="width:32px;height:32px"
              ></span>
              }
            </div>
            <p class="text-ink-400">
              <span class="font-bold text-white">+{{ totalStock }}</span> itens em estoque
            </p>
          </div>
        </div>

        <!-- Imagem do produto em destaque -->
        <div class="relative hidden md:flex items-center justify-center">
          <div
            class="absolute w-80 h-80 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 opacity-20 blur-3xl"
            aria-hidden="true"
          ></div>
          @if (featuredImage) {
          <img
            [src]="featuredImage"
            alt="Produto em destaque"
            class="relative w-full max-w-md aspect-square object-cover rounded-3xl shadow-2xl ring-1 ring-white/20 rotate-2 hover:rotate-0 transition duration-500"
          />
          }
        </div>
      </div>
    </section>

    <!-- TRUST BADGES -->
    <section class="border-b border-ink-100 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-accent-100 text-accent-700" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Pagamento seguro</p>
            <p class="text-xs text-ink-500">PIX e cartão via Stripe</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-brand-100 text-brand-700" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Frete rápido</p>
            <p class="text-xs text-ink-500">Grátis acima de R$ 199</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center h-11 w-11 rounded-xl bg-ink-100 text-ink-800" aria-hidden="true">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </span>
          <div>
            <p class="text-sm font-bold text-ink-950">Qualidade selecionada</p>
            <p class="text-xs text-ink-500">Produtos pra sua evolução</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DESTAQUES -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-14">
      <div class="flex items-end justify-between mb-8">
        <div>
          <p class="section-kicker">Os queridinhos</p>
          <h2 class="section-title">Em destaque</h2>
        </div>
        <a routerLink="/products" class="link-btn">Ver todos →</a>
      </div>

      @if (loading) {
      <div class="grid gap-5" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        @for (i of skeleton; track i) {
        <div class="skeleton h-[340px]">
          <div class="skeleton-shimmer"></div>
        </div>
        }
      </div>
      } @else {
      <div class="grid gap-5" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        @for (product of featured; track product.id) {
        <app-product-card [product]="product" />
        }
      </div>
      }
    </section>

    <!-- COMO FUNCIONA -->
    <section class="bg-ink-50 py-14">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <p class="section-kicker">Simples e rapido</p>
          <h2 class="section-title">Como funciona</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="mx-auto h-14 w-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-black">1</div>
            <h3 class="mt-4 font-display font-bold text-ink-950">Escolha seus produtos</h3>
            <p class="mt-2 text-sm text-ink-500 leading-relaxed">Navegue pelo catalogo, filtre por categoria e encontre o que precisa pro seu treino.</p>
          </div>
          <div class="text-center">
            <div class="mx-auto h-14 w-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-black">2</div>
            <h3 class="mt-4 font-display font-bold text-ink-950">Finalize no checkout</h3>
            <p class="mt-2 text-sm text-ink-500 leading-relaxed">Pague via PIX ou cartao pelo Stripe. Pagamento 100% seguro e criptografado.</p>
          </div>
          <div class="text-center">
            <div class="mx-auto h-14 w-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-black">3</div>
            <h3 class="mt-4 font-display font-bold text-ink-950">Receba em casa</h3>
            <p class="mt-2 text-sm text-ink-500 leading-relaxed">Envio rapido com frete gratis acima de R$ 199. Acompanhe seu pedido pelo painel.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIAS -->
    @if (categories.length > 0) {
    <section class="bg-ink-950 py-14 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="mb-8">
          <p class="section-kicker !text-accent-400">Navegue por</p>
          <h2 class="font-display text-3xl font-extrabold tracking-tight">Categorias</h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          @for (cat of categories; track cat.id) {
          <a
            routerLink="/products"
            [queryParams]="{ categoria: cat.slug }"
            class="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10 hover:border-accent-500/40"
          >
            <div>
              <p class="font-display font-bold">{{ cat.name }}</p>
              <p class="text-xs text-ink-400 mt-0.5">{{ categoryCount(cat.id) }} produto(s)</p>
            </div>
            <span
              class="flex items-center justify-center h-8 w-8 rounded-full bg-accent-500 text-ink-950 group-hover:translate-x-1 transition text-xs"
              aria-hidden="true"
            >→</span>
          </a>
          }
        </div>
      </div>
    </section>
    }

    <!-- DEPOIMENTOS -->
    <section class="py-14 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <p class="section-kicker">Quem ja comprou</p>
          <h2 class="section-title">Depoimentos</h2>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="rounded-2xl border border-ink-100 p-6 bg-white">
            <div class="flex items-center gap-1 text-brand-500 text-sm mb-3">★★★★★</div>
            <p class="text-sm text-ink-600 leading-relaxed">"Comprei o kit de elasticos e a bola pilates. Qualidade incrivel pelo preco. Entrega foi super rapida, chegou em 3 dias uteis!"</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">MC</div>
              <div>
                <p class="text-sm font-bold text-ink-950">Mariana Costa</p>
                <p class="text-xs text-ink-400">Fisioterapeuta</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-ink-100 p-6 bg-white">
            <div class="flex items-center gap-1 text-brand-500 text-sm mb-3">★★★★★</div>
            <p class="text-sm text-ink-600 leading-relaxed">"O percussor de massagem e sensacional. Uso todo dia pos-treino. O site e facil de navegar e o pagamento via PIX foi instantaneo."</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-sm font-bold">RS</div>
              <div>
                <p class="text-sm font-bold text-ink-950">Rafael Silva</p>
                <p class="text-xs text-ink-400">Personal Trainer</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-ink-100 p-6 bg-white">
            <div class="flex items-center gap-1 text-brand-500 text-sm mb-3">★★★★★</div>
            <p class="text-sm text-ink-600 leading-relaxed">"Ja pedi 3 vezes e sempre chegou certinho. O halter regulavel e muito bom, economiza espaco. Recomendo demais!"</p>
            <div class="mt-4 flex items-center gap-3">
              <div class="h-9 w-9 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-sm font-bold">AL</div>
              <div>
                <p class="text-sm font-bold text-ink-950">Ana Luisa</p>
                <p class="text-xs text-ink-400">Aluna de Crossfit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-14 bg-ink-50">
      <div class="max-w-3xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-10">
          <p class="section-kicker">Duvidas?</p>
          <h2 class="section-title">Perguntas frequentes</h2>
        </div>

        <div class="space-y-4">
          <details class="group rounded-2xl bg-white border border-ink-100 overflow-hidden">
            <summary class="px-6 py-4 cursor-pointer font-bold text-ink-950 text-sm hover:bg-ink-50 transition select-none list-none flex items-center justify-between">
              Quais formas de pagamento voces aceitam?
              <span class="text-ink-400 group-open:rotate-45 transition text-xl">+</span>
            </summary>
            <div class="px-6 pb-4 text-sm text-ink-600 leading-relaxed">
              Aceitamos PIX (com desconto), cartao de credito e debito via Stripe. O pagamento e 100% seguro com criptografia SSL.
            </div>
          </details>

          <details class="group rounded-2xl bg-white border border-ink-100 overflow-hidden">
            <summary class="px-6 py-4 cursor-pointer font-bold text-ink-950 text-sm hover:bg-ink-50 transition select-none list-none flex items-center justify-between">
              O frete e gratis?
              <span class="text-ink-400 group-open:rotate-45 transition text-xl">+</span>
            </summary>
            <div class="px-6 pb-4 text-sm text-ink-600 leading-relaxed">
              Sim! Frete gratis para compras acima de R$ 199. Para valores abaixo, o frete e calculado no checkout baseado no seu CEP.
            </div>
          </details>

          <details class="group rounded-2xl bg-white border border-ink-100 overflow-hidden">
            <summary class="px-6 py-4 cursor-pointer font-bold text-ink-950 text-sm hover:bg-ink-50 transition select-none list-none flex items-center justify-between">
              Em quanto tempo recebo meu pedido?
              <span class="text-ink-400 group-open:rotate-45 transition text-xl">+</span>
            </summary>
            <div class="px-6 pb-4 text-sm text-ink-600 leading-relaxed">
              O prazo medio e de 3 a 7 dias uteis dependendo da sua regiao. Voce acompanha o rastreio pelo painel de pedidos.
            </div>
          </details>

          <details class="group rounded-2xl bg-white border border-ink-100 overflow-hidden">
            <summary class="px-6 py-4 cursor-pointer font-bold text-ink-950 text-sm hover:bg-ink-50 transition select-none list-none flex items-center justify-between">
              Posso trocar ou devolver um produto?
              <span class="text-ink-400 group-open:rotate-45 transition text-xl">+</span>
            </summary>
            <div class="px-6 pb-4 text-sm text-ink-600 leading-relaxed">
              Sim! Voce tem 7 dias uteis para solicitar troca ou devolucao de produtos com defeito. Entre em contato pelo e-mail ou WhatsApp.
            </div>
          </details>

          <details class="group rounded-2xl bg-white border border-ink-100 overflow-hidden">
            <summary class="px-6 py-4 cursor-pointer font-bold text-ink-950 text-sm hover:bg-ink-50 transition select-none list-none flex items-center justify-between">
              Preciso criar conta pra comprar?
              <span class="text-ink-400 group-open:rotate-45 transition text-xl">+</span>
            </summary>
            <div class="px-6 pb-4 text-sm text-ink-600 leading-relaxed">
              Nao! Voce so precisa criar conta (ou fazer login) quando for finalizar o checkout. Pode navegar e adicionar produtos ao carrinho sem cadastro.
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA FINAL -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div
        class="rounded-3xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-12 md:px-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-white"
      >
        <div>
          <h2 class="font-display text-3xl md:text-4xl font-black tracking-tight">
            Bora treinar? 🏋️
          </h2>
          <p class="mt-2 text-white/85 text-lg max-w-md">
            Monte seu carrinho e receba em casa. Comece agora.
          </p>
        </div>
        <a
          routerLink="/products"
          class="btn bg-white text-brand-700 !px-8 !py-4 !text-lg hover:bg-accent-300"
        >
          Começar agora
        </a>
      </div>
    </section>
  `,
})
export class HomePage implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];

  loading = true;
  skeleton = Array.from({ length: 4 }, (_, i) => i);

  heroDots = ['#f97316', '#84cc16', '#fb923c', '#a3e635'];

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    forkJoin({
      products: this.productsService.findAll().pipe(catchError(() => of([]))),
      categories: this.categoriesService.findAll().pipe(catchError(() => of([]))),
    }).subscribe(({ products, categories }) => {
      this.products = products ?? [];
      this.categories = (categories ?? []).sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
      );
      this.loading = false;
    });
  }

  get featured(): Product[] {
    const active = this.products.filter((p) => p.stock > 0).slice(0, 8);
    return active.length ? active : this.products.slice(0, 8);
  }

  get totalStock(): number {
    return this.products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  }

  get featuredImage(): string | null {
    const p = this.featured[0];
    return p?.imageUrl ?? null;
  }

  categoryCount(id: string): number {
    return this.products.filter((p) =>
      (p.categories ?? []).some((c) => c.id === id)
    ).length;
  }
}
