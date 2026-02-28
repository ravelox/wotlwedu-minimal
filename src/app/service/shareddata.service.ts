import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { WotlweduPreference } from "../datamodel/wotlwedu-preference.model";
import { PreferenceDataService } from "./preferencedata.service";
import { DataSignalService } from "./datasignal.service";
import { firstValueFrom } from "rxjs";

import { io, Socket } from "socket.io-client";
import { AuthDataService } from "./authdata.service";
import { ConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class SharedDataService {
  private static readonly DEFAULT_ITEMS_PER_PAGE = 25;
  private status: any[] = [];
  private preference: WotlweduPreference[] = [];
  private _ioSocket: Socket = null;
  private isAuthenticated = false;
  private _statusLoadPromise: Promise<void> | null = null;

  constructor(
    private http: HttpClient,
    private preferenceDataService: PreferenceDataService,
    private dataSignalService: DataSignalService,
    private authDataService: AuthDataService,
    private configService: ConfigService
  ) {
    console.trace("In SharedDataService constructor");
    this._ioSocket = io(this.configService.config.apiUrl);
    this._ioSocket.on("notification", (event) => {
      this.dataSignalService.hasNotification(event || null);
    });
    this._ioSocket.on("refresh", () => {
      this.dataSignalService.refreshData();
    });
    this.dataSignalService.refreshDataSignal.subscribe({
      next: () => {
        if (!this.isAuthenticated) {
          return;
        }
        this.ensureStatusNamesLoaded(true);
        this.loadPreferences();
      },
    });

    this.preferenceDataService.dataChanged.subscribe({
      next: (preferenceData) => {
        if (preferenceData) this.preference = preferenceData;
      },
    });

    this.authDataService.authData.subscribe({
      next: (authData) => {
        if (authData && authData.id) {
          this.isAuthenticated = true;
          this.ensureStatusNamesLoaded(true);
          this._ioSocket.emit("register", { id: authData.id });
          this._ioSocket.on("connected", () => {
            console.log("Connected");
          });
          this._ioSocket.io.on("reconnect", () => {
            console.log(this._ioSocket.id + ": reconnect");
            this._ioSocket.emit("register", { id: authData.id });
          });
        } else {
          this.isAuthenticated = false;
          this._ioSocket.emit("unregister");
        }
      },
    });
  }

  refresh() {
    this.dataSignalService.refreshData();
  }

  private loadStatusNames() {
    const url = this.configService.config.apiUrl + "helper/" + "status";
    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        if (response && response.data && response.data.status) {
          this.status = response.data.status;
          this._statusLoadPromise = null;
        }
      },
      error: () => {
        this._statusLoadPromise = null;
      },
    });
  }

  private async loadStatusNamesAsync() {
    const url = this.configService.config.apiUrl + "helper/" + "status";
    const response: any = await firstValueFrom(
      this.http.get<WotlweduApiResponse>(url)
    );
    if (response && response.data && response.data.status) {
      this.status = response.data.status;
    }
  }

  ensureStatusNamesLoaded(force: boolean = false) {
    if (!force && this.status && this.status.length > 0) {
      return Promise.resolve();
    }

    if (!this._statusLoadPromise || force) {
      this._statusLoadPromise = this.loadStatusNamesAsync()
        .catch(() => undefined)
        .finally(() => {
          this._statusLoadPromise = null;
        });
    }

    return this._statusLoadPromise;
  }

  private loadPreferences() {
    this.preferenceDataService.getAllData();
  }

  loadPrefAsync() {
    const res = this.preferenceDataService.getAllDataAsync();
  }

  getStatusId(name: string) {
    if (this.status && this.status.length > 0) {
      const foundStatus = this.status.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
      );
      if (foundStatus) {
        return foundStatus.id;
      }
    }
    this.ensureStatusNamesLoaded();
    return 0;
  }

  getPreference(name: string) {
    if (this.preference) {
      const foundPref = this.preference.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
      );
      if (foundPref) {
        return foundPref.value;
      } else {
        return null;
      }
    } else {
      this.preferenceDataService.getAllData();
    }
  }

  getItemsPerPage() {
    const preferenceValue = Number(this.getPreference("itemsperpage"));
    if (Number.isFinite(preferenceValue) && preferenceValue > 0) {
      return preferenceValue;
    }

    return SharedDataService.DEFAULT_ITEMS_PER_PAGE;
  }
}
