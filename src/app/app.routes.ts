import { Routes } from '@angular/router';
import { ProductsPage } from './features/products/products.page';
import { CartPage } from './features/cart/cart.page';
import { LoginPage } from './features/auth/login.page';
import { authGuard } from './core/guards/auth.guard';
import { OrdersPage } from './features/orders/orders.page';
import { RegisterPage } from './features/auth/register.page';
import { guestGuard } from './core/guards/guest.guard';
import { ProfilePage } from './features/profile/profile.page';
import { ChangePasswordPage } from './features/profile/change-password.page';
import { checkoutSuccessOnceGuard } from './features/checkout/checkout-success.guard';
import { nonEmptyCartGuard } from './core/guards/non-empty-cart.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },

  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },

  { path: 'products', component: ProductsPage },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product.page').then((m) => m.ProductPage),
  },

  // ✅ Carrinho público (como loja real)
  { path: 'cart', component: CartPage },

  // ✅ Rotas que exigem login
  { path: 'orders', component: OrdersPage, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePage, canActivate: [authGuard] },
  { path: 'profile/password', component: ChangePasswordPage, canActivate: [authGuard] },

  {
    path: 'checkout',
    canActivate: [authGuard, nonEmptyCartGuard],
    loadComponent: () => import('./features/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'checkout/success',
    canActivate: [authGuard, checkoutSuccessOnceGuard],
    loadComponent: () =>
      import('./features/checkout/checkout-success.page').then((m) => m.CheckoutSuccessPage),
  },
];
