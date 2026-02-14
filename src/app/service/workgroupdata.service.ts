import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { Subject, of } from "rxjs";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { SharedDataService } from "./shareddata.service";
import { ConfigService } from "./config.service";
import { WotlweduWorkgroup } from "../datamodel/wotlwedu-workgroup.model";

@Injectable({ providedIn: "root" })
export class WorkgroupDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduWorkgroup[]>();
  details = new Subject<WotlweduWorkgroup>();

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private configService: ConfigService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(workgroupId: string) {
    if (!workgroupId || workgroupId === "") return null;
    const url =
      this.configService.config.apiUrl +
      "workgroup/" +
      workgroupId +
      "?" +
      "detail=user,category";
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference("itemsperpage");
    const url =
      this.configService.config.apiUrl +
      "workgroup/" +
      "?" +
      "detail=user,category" +
      "&page=" +
      this.page +
      "&items=" +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? "&filter=" + encodeURIComponent(this.currentFilter)
        : "");

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduWorkgroup[] = response.data.workgroups;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  // Fetch a page of workgroups without mutating internal Subjects.
  listWorkgroups(page: number = 1, items: number = 200, filter?: string) {
    const url =
      this.configService.config.apiUrl +
      "workgroup/" +
      "?" +
      "detail=user,category" +
      "&page=" +
      page +
      "&items=" +
      items +
      (filter && filter.length > 0 ? "&filter=" + encodeURIComponent(filter) : "");
    return this.http.get<WotlweduApiResponse>(url);
  }

  saveWorkgroup(workgroupId: string, name: string, description: string, organizationId?: string) {
    const payload: any = {
      name: name,
      description: description,
    };
    if (organizationId) payload.organizationId = organizationId;

    let url = this.configService.config.apiUrl + "workgroup/";

    if (workgroupId) {
      url = url + workgroupId;
      return this.http.put<WotlweduApiResponse>(url, payload);
    }
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  addUsers(workgroupId: string, users: string[]) {
    if (!workgroupId || !users || users.length === 0) return of({});
    let url = this.configService.config.apiUrl + "workgroup/" + workgroupId + "/bulkuseradd";
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteUsers(workgroupId: string, users: string[]) {
    if (!workgroupId || !users || users.length === 0) return of({});
    let url = this.configService.config.apiUrl + "workgroup/" + workgroupId + "/bulkuserdel";
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteWorkgroup(workgroupId: string) {
    let url = this.configService.config.apiUrl + "workgroup/" + workgroupId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduWorkgroup) {
    this.details.next(details);
  }
}
