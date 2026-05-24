import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { User } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: '/admin' } });
  }

  const user = auth.user();
  if (!user) {
    return http.get<User>('/api/users/me').pipe(
      map((loadedUser) => (loadedUser.isAdmin ? true : router.createUrlTree(['/products']))),
      catchError(() => of(router.createUrlTree(['/login'], { queryParams: { returnUrl: '/admin' } }))),
    );
  }

  return user.isAdmin ? true : router.createUrlTree(['/products']);
};
