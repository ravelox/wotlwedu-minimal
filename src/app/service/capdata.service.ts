import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { Subject } from 'rxjs';
import { WotlweduCap } from '../datamodel/wotlwedu-cap.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';

@Injectable({ providedIn: 'root' })
export class CapDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduCap[]>();
  details = new Subject<WotlweduCap>();
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'capability/';

  constructor(private http: HttpClient) {
    super();
    this.setCallbackFunction(this.getAllData);

    // By default, we want all the capabilities so we'll set the
    // item limit to a very high number
    this.itemsPerPage = 1000;
  }

  getData(capId: string) {
    if (!capId || capId === '') return null;
    const url = this.ENDPOINT + capId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    const url =
      this.ENDPOINT +
      '?page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduCap[] = response.data.capabilities;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  setData(details: WotlweduCap) {
    this.details.next(details);
  }
}
