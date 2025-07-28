import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { Subject } from "rxjs";
import { WotlweduCategory } from "../datamodel/wotlwedu-category.model";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { SharedDataService } from "./shareddata.service";
import { ConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class CategoryDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduCategory[]>();
  details = new Subject<WotlweduCategory>();

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private configService: ConfigService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(categoryId: string) {
    if (!categoryId || categoryId === "") return null;
    const url =
      this.configService.config.apiUrl + "category/" + categoryId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference("itemsperpage");

    const url =
      this.configService.config.apiUrl +
      "category/" +
      "?page=" +
      this.page +
      "&items=" +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");

    this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduCategory[] = response.data.categories;
        this.page = response.data.page;
        this.itemsPerPage = response.data.itemsPerPage;
        this.total = response.data.total;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  saveCategory(categoryId: string, name: string, description: string) {
    const payload = {
      name: name,
      description: description,
    };
    let url = this.configService.config.apiUrl + "category/";

    if (categoryId) {
      url = url + categoryId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteCategory(categoryId: string) {
    let url = this.configService.config.apiUrl + "category/" + categoryId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduCategory) {
    this.details.next(details);
  }
}
