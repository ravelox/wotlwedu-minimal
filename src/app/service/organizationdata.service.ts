import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { Subject } from "rxjs";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { SharedDataService } from "./shareddata.service";
import { ConfigService } from "./config.service";
import { WotlweduOrganization } from "../datamodel/wotlwedu-organization.model";

@Injectable({ providedIn: "root" })
export class OrganizationDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduOrganization[]>();
  details = new Subject<WotlweduOrganization>();

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private configService: ConfigService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(organizationId: string) {
    if (!organizationId || organizationId === "") return null;
    const url = this.configService.config.apiUrl + "organization/" + organizationId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = this.sharedDataService.getItemsPerPage();

    const url =
      this.configService.config.apiUrl +
      "organization/" +
      "?page=" +
      this.page +
      "&items=" +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");

    this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduOrganization[] = response.data.organizations;
        this.page = response.data.page;
        this.itemsPerPage = response.data.itemsPerPage;
        this.total = response.data.total;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  saveOrganization(organizationId: string, name: string, description: string, active: boolean) {
    const payload: any = {
      name: name,
      description: description,
      active: active,
    };
    let url = this.configService.config.apiUrl + "organization/";

    if (organizationId) {
      url = url + organizationId;
      return this.http.put<WotlweduApiResponse>(url, payload);
    }
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  deleteOrganization(organizationId: string) {
    let url = this.configService.config.apiUrl + "organization/" + organizationId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduOrganization) {
    this.details.next(details);
  }
}

