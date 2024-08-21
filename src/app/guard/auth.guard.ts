import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthDataService } from '../service/authdata.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authDataService = inject(AuthDataService);
  const router: Router = inject(Router);

  return authDataService.authData.pipe(
    map((authDetails) => {
      if (authDetails) {
        return true;
      }
      router.navigate(['/auth'])
      return false;
    })
  );
};
