import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

const WOTLWEDU_STORAGE_NAME = 'wotlwedu-auth';

class StoreData {
  id: string = null;
  authToken: string = null;
  refreshToken: string = null;
  displayName: string = null;
  // Legacy "admin" maps to system-admin behavior. Keep for backward compat.
  admin: boolean = false;
  systemAdmin: boolean = false;
  organizationId: string = null;
  organizationAdmin: boolean = false;
  workgroupAdmin: boolean = false;
  adminWorkgroupId: string = null;
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
    const storedValue = localStorage.getItem(WOTLWEDU_STORAGE_NAME);
    if (!storedValue) {
      this.currentData = new StoreData();
      return this.currentData;
    }

    try {
      const parsedData = JSON.parse(storedValue);
      this.currentData = parsedData ? { ...new StoreData(), ...parsedData } : new StoreData();
    } catch {
      this.currentData = new StoreData();
    }

    return this.currentData;
  }

  checkTokenExpiration() {
    const tokenData = { auth: null, refresh: null };
    if (!this.currentData) {
      this.currentData = new StoreData();
      return tokenData;
    }

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
    return this.currentData.admin || this.currentData.systemAdmin;
  }

  public setAdmin(admin: boolean) {
    this.currentData.admin = admin;
    // Keep systemAdmin in sync for old payloads.
    if (admin === true) this.currentData.systemAdmin = true;
  }

  public getSystemAdmin() {
    if (!this.currentData) return false;
    return this.currentData.systemAdmin || this.currentData.admin;
  }

  public setSystemAdmin(systemAdmin: boolean) {
    this.currentData.systemAdmin = systemAdmin;
    // Maintain legacy admin mirror.
    this.currentData.admin = systemAdmin;
  }

  public getOrganizationId() {
    if (!this.currentData) return null;
    return this.currentData.organizationId;
  }

  public setOrganizationId(organizationId: string) {
    this.currentData.organizationId = organizationId;
  }

  public getOrganizationAdmin() {
    if (!this.currentData) return false;
    return this.currentData.organizationAdmin === true;
  }

  public setOrganizationAdmin(organizationAdmin: boolean) {
    this.currentData.organizationAdmin = organizationAdmin === true;
  }

  public getWorkgroupAdmin() {
    if (!this.currentData) return false;
    return this.currentData.workgroupAdmin === true;
  }

  public setWorkgroupAdmin(workgroupAdmin: boolean) {
    this.currentData.workgroupAdmin = workgroupAdmin === true;
  }

  public getAdminWorkgroupId() {
    if (!this.currentData) return null;
    return this.currentData.adminWorkgroupId;
  }

  public setAdminWorkgroupId(adminWorkgroupId: string) {
    this.currentData.adminWorkgroupId = adminWorkgroupId;
  }
}
