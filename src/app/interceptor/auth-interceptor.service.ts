import {
  HTTP_INTERCEPTORS,
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpEvent,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { TokenDataStorageService } from '../service/tokendata.service';
import { Observable, throwError } from 'rxjs';
import { AuthDataService } from '../service/authdata.service';
import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { Router } from '@angular/router';
import { DataSignalService } from '../service/datasignal.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  handlingRefresh: boolean = false;

  constructor(
    private authService: AuthDataService,
    private tokenDataService: TokenDataStorageService,
    private router: Router,
    private dataSignalService: DataSignalService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    req = this.addAuthHeader(req);
    return next.handle(req).pipe(
      catchError((error) => {

        /* Handle a redirect */
        if( error instanceof HttpErrorResponse && error.status === 302) {
          if( error.error && error.error.data && error.error.data.toURL) {
            this.router.navigate([error.error.data.toURL]);
          }
        }

        /* If the token has expired, try a refresh */
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401(req, next);
        }

        /* If forbidden, go to the login page */
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.router.navigate(['/auth']);
        }

        if( error instanceof HttpErrorResponse && error.status === 0 ) {
          this.router.navigate(['/','error'])
        }

        return throwError(() => {
          return error;
        });
      })
    );
  }

  private addAuthHeader(req: HttpRequest<any>) {
    const currentAuthToken = this.tokenDataService.getAuthToken();
    if (!currentAuthToken) {
      return req;
    }

    return req.clone({
      headers: req.headers.set('Authorization', currentAuthToken),
    });
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.handlingRefresh) {
      this.handlingRefresh = true;

      const currentRefreshToken = this.tokenDataService.getRefreshToken();

      if (currentRefreshToken) {
        return this.authService.refreshToken().pipe(
          tap((response: WotlweduApiResponse) => {
            this.tokenDataService.setAuthToken(response.data.authToken);
            this.tokenDataService.setRefreshToken(response.data.refreshToken);
            this.tokenDataService.setId(response.data.userId);
            this.tokenDataService.save();
            this.dataSignalService.refreshData();
          }),
          switchMap(() => {
            req = this.addAuthHeader(req);
            this.handlingRefresh = false;
            return next.handle(req);
          }),
          catchError((err) => {
            this.handlingRefresh = false;
            return throwError(() => {
              return this.router.navigate(['/auth']);
            });
          })
        );
      }
    }
    return next.handle(req);
  }
}

export const AuthInterceptorProvider = {
  provide: HTTP_INTERCEPTORS,
  useClass: AuthInterceptorService,
  multi: true,
};
