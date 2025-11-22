import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, of, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { TokenDataStorageService } from "./tokendata.service";
import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { DataSignalService } from "./datasignal.service";
import { ConfigService } from "./config.service";

@Injectable()
export class AuthDataService {
  authData = new BehaviorSubject<any>(null);
  isLoggedIn = new BehaviorSubject<any>(null);
  userDisplayName: string = null;
  private loggedIn: boolean = false;
  private _errorState: boolean = false;

  constructor(
    private http: HttpClient,
    private tokenDataService: TokenDataStorageService,
    private dataSignalService: DataSignalService,
    private configService: ConfigService
  ) {}

  login(email: string, password: string) {
    const credentials = { email: email, password: password };
    let url = this.configService.config.apiUrl + "login/";

    return this.http.post<WotlweduApiResponse>(url, credentials).pipe(
      catchError((err: any) => {
        return throwError(() => err);
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
    this.tokenDataService.setAdmin(authResponse.admin);
    const displayName =
      (authResponse.firstName ? authResponse.firstName : "") +
      (authResponse.lastName
        ? (authResponse.firstName ? " " : "") + authResponse.lastName
        : "");
    this.tokenDataService.setDisplayName(displayName);
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
    let url = this.configService.config.apiUrl + "login/refresh";
    return this.http.post<WotlweduApiResponse>(url, refreshCredentials);
  }

  resetPassword(userId: string, token: string, encryptedPwd: string) {
    const payload = {
      resetToken: token,
      newPassword: encryptedPwd,
    };
    let url = this.configService.config.apiUrl + "login/password/";
    return this.http.put<WotlweduApiResponse>(url + userId, payload);
  }

  gen2FAVerificationToken() {
    let url = this.configService.config.apiUrl + "login/gentoken";
    return this.http.post<WotlweduApiResponse>(url, {});
  }

  verify2FA(verificationDetails: any) {
    let url = this.configService.config.apiUrl + "login/verify2fa";
    if (!verificationDetails) return of(null);
    return this.http.post<WotlweduApiResponse>(url, verificationDetails).pipe(
      catchError((err: any) => {
        return throwError(() => err);
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
    let url = this.configService.config.apiUrl + "login/2fa";
    return this.http.post<WotlweduApiResponse>(url, {});
  }

  setLoggedIn(state: boolean) {
    this.loggedIn = state;
    this.userDisplayName = this.tokenDataService.getDisplayName();
    this.isLoggedIn.next({
      loginState: this.loggedIn,
      userName: this.userDisplayName,
      isAdmin: this.tokenDataService.getAdmin(),
    });
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
    let url = this.configService.config.apiUrl + "login/resetreq";
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
