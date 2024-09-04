import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { GlobalVariable } from "../global";
import { WotlweduPreference } from "../datamodel/wotlwedu-preference.model";
import { PreferenceDataService } from "./preferencedata.service";
import { DataSignalService } from "./datasignal.service";
import { firstValueFrom } from "rxjs";

import { io, Socket } from "socket.io-client";
import { AuthDataService } from "./authdata.service";

@Injectable({ providedIn: "root" })
export class SharedDataService {
  private ENDPOINT = GlobalVariable.BASE_API_URL + "helper/";
  private status: any[] = [];
  private preference: WotlweduPreference[] = [];
  private _ioSocket: Socket = null;

  constructor(
    private http: HttpClient,
    private preferenceDataService: PreferenceDataService,
    private dataSignalService: DataSignalService,
    private authDataService: AuthDataService
  ) {
    this._ioSocket = io(GlobalVariable.BASE_API_URL);
    this._ioSocket.on("notification", () => {
      this.dataSignalService.hasNotification();
    });
    this.dataSignalService.refreshDataSignal.subscribe({
      next: () => {
        this.loadStatusNames();
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
          this._ioSocket.emit("register", { id: authData.id });
          this._ioSocket.on("connected", () => {
            console.log("Connected");
          });
          this._ioSocket.io.on("reconnect", () => {
            console.log(this._ioSocket.id + ": reconnect");
            this._ioSocket.emit("register", { id: authData.id });
          });
        } else {
          this._ioSocket.emit("unregister");
        }
      },
    });
  }

  refresh() {
    this.dataSignalService.refreshData();
  }

  private loadStatusNames() {
    const url = this.ENDPOINT + "status";
    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        if (response && response.data && response.data.status) {
          this.status = response.data.status;
        }
      },
    });
  }

  private async loadStatusNamesAsync() {
    const url = this.ENDPOINT + "status";
    const response: any = firstValueFrom(
      this.http.get<WotlweduApiResponse>(url)
    );
    if (response && response.data && response.data.status) {
      const objects: WotlweduPreference[] = response.data.preferences;
      this.status = response.data.status;
    }
  }

  private loadPreferences() {
    this.preferenceDataService.getAllData();
  }

  loadPrefAsync() {
    const res = this.preferenceDataService.getAllDataAsync();
  }

  getStatusIdAsync(name: string) {
    this.loadStatusNamesAsync();
    const foundStatus = this.status.find(
      (x) => x.name.toLowerCase() === name.toLowerCase()
    );
    if (foundStatus) {
      return foundStatus.id;
    } else {
      return 0;
    }
  }

  getStatusId(name: string) {
    if (this.status) {
      const foundStatus = this.status.find(
        (x) => x.name.toLowerCase() === name.toLowerCase()
      );
      if (foundStatus) {
        return foundStatus.id;
      } else {
        return this.getStatusIdAsync(name);
      }
    } else {
      return 0;
    }
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
}
