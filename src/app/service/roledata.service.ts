import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { Subject, of } from 'rxjs';
import { WotlweduRole } from '../datamodel/wotlwedu-role.model';
import { PreferenceDataService } from './preferencedata.service';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class RoleDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduRole[]>();
  details = new Subject<WotlweduRole>();
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'role/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(roleId: string) {
    if (!roleId || roleId === '') return null;
    const url = this.ENDPOINT + roleId + "?detail=capability,user";
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');
    const url =
      this.ENDPOINT +
      '?detail=capability,user' +
      '&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduRole[] = response.data.roles;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  saveRole(roleId: string, name: string, description: string) {
    const payload = {
      name: name,
      description: description,
    };
    let url = this.ENDPOINT;

    if (roleId) {
      url = url + roleId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  addCapabilities(roleId: string, capabilities: string[]) {
    if (!roleId || !capabilities || capabilities.length === 0) return of({});
    let url = this.ENDPOINT + roleId + '/bulkcapadd';
    const payload = { capabilityList: capabilities };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteCapabilities(roleId: string, capabilities: string[]) {
    if (!roleId || !capabilities || capabilities.length === 0) return of({});
    let url = this.ENDPOINT + roleId + '/bulkcapdel';
    const payload = { capabilityList: capabilities };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  addUsers(roleId: string, users: string[]) {
    if (!roleId || !users || users.length === 0) return of({});
    let url = this.ENDPOINT + roleId + '/bulkuseradd';
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteUsers(roleId: string, users: string[]) {
    if (!roleId || !users || users.length === 0) return of({});
    let url = this.ENDPOINT + roleId + '/bulkuserdel';
    const payload = { userList: users };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteRole(roleId: string) {
    let url = this.ENDPOINT + roleId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduRole) {
    this.details.next(details);
  }
}
