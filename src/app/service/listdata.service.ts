import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { of, Subject } from "rxjs";
import { WotlweduList } from "../datamodel/wotlwedu-list.model";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { SharedDataService } from "./shareddata.service";
import { ConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class ListDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduList[]>();
  details = new Subject<WotlweduList>();

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private configService: ConfigService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(listId: string, notificationId?: string) {
    if (!listId || listId === "") return null;
    let url = this.configService.config.apiUrl + "list/" + listId;

    if (notificationId) {
      url = url + "/notif/" + notificationId;
    }

    url = url + "?detail=category,item,image";

    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference("itemsperpage");
    const url =
      this.configService.config.apiUrl +
      "list/" +
      "?detail=category,item,image" +
      "&page=" +
      this.page +
      "&items=" +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduList[] = response.data.lists;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  saveList(listId: string, name: string, description: string) {
    const payload = {
      name: name,
      description: description,
    };
    let url = this.configService.config.apiUrl + "list/";

    if (listId) {
      url = url + listId;
      return this.http.put<WotlweduApiResponse>(url, payload);
    }
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  addItems(listId: string, items: string[]) {
    if (!listId || !items || items.length === 0) return of({});
    let url =
      this.configService.config.apiUrl +
      "list/" +
      listId +
      "/bulkitemadd";
    const payload = { itemList: items };
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  deleteItems(listId: string, items: string[]) {
    if (!listId || !items || items.length === 0) return of({});
    let url =
      this.configService.config.apiUrl +
      "list/" +
      listId +
      "/bulkitemdel";
    const payload = { itemList: items };
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  deleteList(listId: string) {
    let url = this.configService.config.apiUrl + "list/" + listId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  shareList(listId: string, recipientId: string) {
    if (!listId || !recipientId) return of(null);
    let url =
      this.configService.config.apiUrl +
      "list/" +
      "share/" +
      listId +
      "/recipient/" +
      recipientId;
    return this.http.post<WotlweduApiResponse>(url, {});
  }

  acceptList(notificationId: string) {
    if (!notificationId) return of(null);
    let url =
      this.configService.config.apiUrl +
      "list/" +
      "accept/" +
      notificationId;
    return this.http.post<WotlweduApiResponse>(url, {});
  }

  setData(details: WotlweduList) {
    this.details.next(details);
  }
}
