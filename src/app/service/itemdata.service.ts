import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { of, Subject } from 'rxjs';
import { WotlweduItem } from '../datamodel/wotlwedu-item.model';
import { PreferenceDataService } from './preferencedata.service';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class ItemDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduItem[]>();
  details = new Subject<WotlweduItem>();
  private ENDPOINT = GlobalVariable.BASE_API_URL + 'item/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(itemId: string, notificationId?: string) {
    if (!itemId || itemId === '') return null;
    let url = this.ENDPOINT + itemId;

    if( notificationId ) {
      url = url + '/notif/' + notificationId;
    }
    
    url = url + '?detail=image';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');
    const url =
      this.ENDPOINT +
      '?detail=image&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduItem[] = response.data.items;
        this.page = response.data.page;
        this.itemsPerPage = response.data.itemsPerPage;
        this.total = response.data.total;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  saveItem(itemObject: WotlweduItem) {
    const payload = {
      id: itemObject.id,
      name: itemObject.name,
      description: itemObject.description,
      url: itemObject.url,
      location: itemObject.location,
      imageId: itemObject.image.id,
      categoryId: null,
    };

    let url = this.ENDPOINT;

    if (itemObject.id) {
      url = url + itemObject.id;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteItem(itemId: string) {
    let url = this.ENDPOINT + itemId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  shareItem(itemId: string, recipientId: string) {
    if( ! itemId || ! recipientId ) return of(null);
    let url = this.ENDPOINT + 'share/' + itemId + "/recipient/" + recipientId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  acceptItem(notificationId: string) {
    if( ! notificationId ) return of(null);
    let url = this.ENDPOINT + 'accept/' + notificationId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduItem) {
    this.details.next(details);
  }
}
