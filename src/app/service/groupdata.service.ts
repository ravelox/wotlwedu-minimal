import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { Subject, of } from "rxjs";
import { WotlweduGroup } from "../datamodel/wotlwedu-group.model";
import { PreferenceDataService } from "./preferencedata.service";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import { GlobalVariable } from "../global";
import { SharedDataService } from "./shareddata.service";

@Injectable({ providedIn: "root" })
export class GroupDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduGroup[]>();
  details = new Subject<WotlweduGroup>();
  private ENDPOINT = GlobalVariable.BASE_API_URL + "group/";

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(groupId: string) {
    if (!groupId || groupId === "") return null;
    const url = this.ENDPOINT + groupId + "?" + "detail=user,category";
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference("itemsperpage");
    const url =
      this.ENDPOINT +
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
        const objects: WotlweduGroup[] = response.data.groups;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  saveGroup(groupId: string, name: string, description: string) {
    const payload = {
      name: name,
      description: description,
    };
    let url = this.ENDPOINT;

    if (groupId) {
      url = url + groupId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  addUsers(groupId: string, users: string[]) {
    if (!groupId || !users || users.length === 0) return of({});
    let url = this.ENDPOINT + groupId + "/bulkuseradd";
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteUsers(groupId: string, users: string[]) {
    if (!groupId || !users || users.length === 0) return of({});
    let url = this.ENDPOINT + groupId + "/bulkuserdel";
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteGroup(groupId: string) {
    let url = this.ENDPOINT + groupId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduGroup) {
    this.details.next(details);
  }
}
