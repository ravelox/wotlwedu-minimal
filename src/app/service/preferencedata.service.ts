import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { firstValueFrom, Subject } from "rxjs";
import { WotlweduPreference } from "../datamodel/wotlwedu-preference.model";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { GlobalVariable } from "../global";

@Injectable({ providedIn: "root" })
export class PreferenceDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduPreference[]>();
  details = new Subject<WotlweduPreference>();
  private ENDPOINT = GlobalVariable.BASE_API_URL + "preference/";

  // For preferences, we will not be restricting to itemsperpage
  constructor(private http: HttpClient) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(preferenceName: string) {
    if (!preferenceName || preferenceName === "") return null;
    const url = this.ENDPOINT + preferenceName;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    const url =
      this.ENDPOINT +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduPreference[] = response.data.preferences;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  async getAllDataAsync(filter?: string) {
    this.filterUpdate(filter);
    const url =
      this.ENDPOINT +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");
    const response: any = firstValueFrom(
      this.http.get<WotlweduApiResponse>(url)
    );
    if (response && response.data && response.data.preferences) {
      const objects: WotlweduPreference[] = response.data.preferences;
      this.page = response.data.page;
      this.total = response.data.total;
      this.itemsPerPage = response.data.itemsPerPage;
      this.dataChanged.next(objects.slice());
    }
  }

  savePreference(preferenceId: string, name: string, value: string) {
    const payload = {
      name: name,
      value: value,
    };
    let url = this.ENDPOINT;

    if (preferenceId) {
      url = url + preferenceId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deletePreference(preferenceId: string) {
    let url = this.ENDPOINT + preferenceId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduPreference) {
    this.details.next(details);
  }
}
