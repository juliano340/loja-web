import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { CheckoutService } from './checkout.service';

export const checkoutSuccessOnceGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const checkout = inject(CheckoutService);
  const router = inject(Router);

  // ✅ 1) Fluxo antigo (PIX / cash): liberado via allowSuccessOnce()
  if (checkout.canShowSuccess()) return true;

  // ✅ 2) Fluxo cartão (Stripe): vem com ?orderId=123
  const qp = route.queryParamMap.get('orderId');
  if (qp) {
    const id = Number(qp);
    if (Number.isFinite(id) && id > 0) {
      // garante para o polling/limpeza no success page
      localStorage.setItem('lastOrderId', String(id));
      return true;
    }
  }

  // ✅ 3) Fallback: se já existe lastOrderId válido, deixa entrar
  const raw = localStorage.getItem('lastOrderId');
  const id = Number(raw);
  if (Number.isFinite(id) && id > 0) return true;

  return router.createUrlTree(['/orders']);
};
