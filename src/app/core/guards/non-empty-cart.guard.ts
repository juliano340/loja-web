import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const nonEmptyCartGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  const router = inject(Router);

  if (cart.items().length > 0) return true;

  return router.createUrlTree(['/cart'], {
    queryParams: { emptyCheckout: '1' },
  });
};
