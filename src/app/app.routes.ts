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

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'products', component: ProductsPage },
  {
    path: 'cart',
    component: CartPage,
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    component: OrdersPage,
    canActivate: [authGuard],
  },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  {
    path: 'profile',
    component: ProfilePage,
    canActivate: [authGuard],
  },
  {
    path: 'profile/password',
    component: ChangePasswordPage,
    canActivate: [authGuard],
  },
];
