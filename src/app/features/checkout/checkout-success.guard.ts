import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CheckoutService } from './checkout.service';

export const checkoutSuccessOnceGuard: CanActivateFn = () => {
  const checkout = inject(CheckoutService);
  const router = inject(Router);

  if (checkout.canShowSuccess()) return true;

  return router.createUrlTree(['/orders']);
};
