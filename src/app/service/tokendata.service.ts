import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

const WOTLWEDU_STORAGE_NAME = 'wotlwedu-auth';

class StoreData {
  id: string = null;
  authToken: string = null;
  refreshToken: string = null;
  displayName: string = null;
  admin: boolean = false;
}

@Injectable()
export class TokenDataStorageService {
  currentData: StoreData = new StoreData();
  jwtHelper: JwtHelperService;

  constructor() {
    this.jwtHelper = new JwtHelperService();
  }

  save() {
    localStorage.setItem(
      WOTLWEDU_STORAGE_NAME,
      JSON.stringify(this.currentData)
    );
  }

  load() {
    this.currentData = JSON.parse(localStorage.getItem(WOTLWEDU_STORAGE_NAME));
    return this.currentData;
  }

  checkTokenExpiration() {
    const tokenData = { auth: null, refresh: null };
    if (this.currentData.authToken) {
      const decodedToken = this.jwtHelper.decodeToken(
        this.currentData.authToken
      );
      const expires = new Date(decodedToken.exp * 1000);
      const timeout = expires.getTime() - Date.now();
      tokenData.auth = { expires: expires, timeout: timeout };
    }
    if (this.currentData.refreshToken) {
      const decodedToken = this.jwtHelper.decodeToken(
        this.currentData.refreshToken
      );
      const expires = new Date(decodedToken.exp * 1000);
      const timeout = expires.getTime() - Date.now();
      tokenData.refresh = { expires: expires, timeout: timeout };
    }

    return tokenData;
  }

  reset() {
    localStorage.removeItem(WOTLWEDU_STORAGE_NAME);
    this.currentData = new StoreData();
  }

  public getId() {
    if (!this.currentData) return null;
    return this.currentData.id;
  }
  public setId(id: string) {
    this.currentData.id = id;
  }

  public getDisplayName() {
    if (!this.currentData) return null;
    return this.currentData.displayName;
  }

  public setDisplayName(displayName: string) {
    this.currentData.displayName = displayName;
  }

  public getAuthToken() {
    if (!this.currentData) return null;
    return this.currentData.authToken;
  }
  public setAuthToken(authToken: string) {
    this.currentData.authToken = authToken;
  }

  public getRefreshToken() {
    if (!this.currentData) return null;
    return this.currentData.refreshToken;
  }
  public setRefreshToken(refreshToken: string) {
    this.currentData.refreshToken = refreshToken;
  }

  public getAdmin() {
    if( !this.currentData ) return false;
    return this.currentData.admin;
  }

  public setAdmin(admin: boolean) {
    this.currentData.admin = admin;
  }
}
