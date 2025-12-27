import { Routes } from '@angular/router';
import { ProductsPage } from './features/products/products.page';
import { CartPage } from './features/cart/cart.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'products',
    component: ProductsPage,
  },
  { path: 'cart', component: CartPage },
];
