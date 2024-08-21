import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { AuthDataService } from '../service/authdata.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { GlobalVariable } from '../global';

export const AdminGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authDataService = inject(AuthDataService);
  const router: Router = inject(Router);

  return authDataService.authData.pipe(
    map((authDetails) => {
      if (authDetails && authDetails.admin === true ) {
        return true;
      }
      router.navigate([ GlobalVariable.DEFAULT_START_PAGE ])
      return false;
    })
  );
};
