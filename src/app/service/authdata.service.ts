import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TokenDataStorageService } from './tokendata.service';
import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { GlobalVariable } from '../global';
import { DataSignalService } from './datasignal.service';

@Injectable()
export class AuthDataService {
  authData = new BehaviorSubject<any>(null);
  isLoggedIn = new BehaviorSubject<any>(null);
  userDisplayName: string = null;
  private loggedIn: boolean = false;
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + "login/";
  private _errorState: boolean = false;

  constructor(
    private http: HttpClient,
    private tokenDataService: TokenDataStorageService,
    private dataSignalService: DataSignalService
  ) {}

  login(email: string, password: string) {
    const credentials = { email: email, password: password };
    return this.http
      .post<WotlweduApiResponse>(this.ENDPOINT, credentials)
      .pipe(
        catchError((err: any) => {
          return throwError(()=>err);
        }),
        tap((response) => {
          this.handleAuth({
            id: response.data.userId,
            authToken: response.data.authToken,
            refreshToken: response.data.refreshToken,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
            admin: response.data.admin,
          });
        })
      );
  }

  private handleAuth(authResponse: any) {
    this.tokenDataService.setId(authResponse.id);
    this.tokenDataService.setAuthToken(authResponse.authToken);
    this.tokenDataService.setRefreshToken(authResponse.refreshToken);
    this.tokenDataService.setAdmin( authResponse.admin )
    const displayName =
      (authResponse.firstName ? authResponse.firstName : '') +
      (authResponse.lastName
        ? (authResponse.firstName ? ' ' : '') + authResponse.lastName
        : '');
        this.tokenDataService.setDisplayName( displayName );
    this.tokenDataService.save();
    this.authData.next(this.tokenDataService.currentData);
    this.setLoggedIn(true);
    this.dataSignalService.refreshData();
  }

  autoLogin() {
    const storedData = this.tokenDataService.load();
    if (storedData) {
      this.setLoggedIn(true);
      this.authData.next(storedData);
    }
  }

  refreshToken() {
    const refreshToken = this.tokenDataService.getRefreshToken();
    const refreshCredentials = { refreshToken: refreshToken };
    return this.http.post<WotlweduApiResponse>(
      this.ENDPOINT + 'refresh',
      refreshCredentials
    );
  }

  resetPassword(userId: string, token: string, encryptedPwd: string) {
    const payload = {
      resetToken: token,
      newPassword: encryptedPwd,
    };
    return this.http.put<WotlweduApiResponse>(
      this.ENDPOINT + 'password/' + userId,
      payload
    );
  }

  gen2FAVerificationToken(){
   const url = this.ENDPOINT + "gentoken";
    return this.http.get<WotlweduApiResponse>(url);
  }
  
  verify2FA(verificationDetails: any)
  {
    if( !verificationDetails ) return of(null);
    const url = this.ENDPOINT + 'verify2fa';
    return this.http.post<WotlweduApiResponse>(url, verificationDetails)
    .pipe(
      catchError((err: any) => {
        return throwError(()=>err);
      }),
      tap((response) => {
        this.handleAuth({
          id: response.data.userId,
          authToken: response.data.authToken,
          refreshToken: response.data.refreshToken,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          admin: response.data.admin,
        });
      })
    );
  }

  enable2FA() {
    return this.http.get<WotlweduApiResponse>(
      this.ENDPOINT + '2fa'
    );
  }

  setLoggedIn(state: boolean) {
    this.loggedIn = state;
    this.userDisplayName = this.tokenDataService.getDisplayName();
    this.isLoggedIn.next({ loginState: this.loggedIn, userName: this.userDisplayName, isAdmin: this.tokenDataService.getAdmin() });
  }

  reset() {
    this.setLoggedIn(false);
    this.tokenDataService.reset();
    this.authData.next(null);
  }

  getExpiration() {
    return this.tokenDataService.checkTokenExpiration();
  }

  requestPasswordReset(email: string) {
    const payload = {
      email: email,
    };
    let url = this.ENDPOINT + 'resetreq';
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  get id() {
    return this.tokenDataService.getId();
  }

  setErrorState() {
    this._errorState = true;
    this.dataSignalService.isError();
  }

  clearErrorState() {
    this._errorState = false;
    this.dataSignalService.clearError();
  }

  get errorState() {
    return this._errorState;
  }
}
