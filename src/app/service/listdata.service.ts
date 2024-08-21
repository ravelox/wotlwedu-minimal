import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { NotificationKind, of, Subject } from 'rxjs';
import { WotlweduList } from '../datamodel/wotlwedu-list.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class ListDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduList[]>();
  details = new Subject<WotlweduList>();
  private ENDPOINT = GlobalVariable.BASE_API_URL + 'list/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(listId: string, notificationId?: string) {
    if (!listId || listId === '') return null;
    let url = this.ENDPOINT + listId;

    if( notificationId ) {
      url = url + "/notif/" + notificationId;
    }

    url = url + "?detail=category,item,image";
    
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');
    const url =
      this.ENDPOINT +
      '?detail=category,item,image' +
      '&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

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
    let url = this.ENDPOINT;

    if (listId) {
      url = url + listId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  addItems(listId: string, items: string[]) {
    if (!listId || !items || items.length === 0) return of({});
    let url = this.ENDPOINT + listId + '/bulkitemadd';
    const payload = { itemList: items };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteItems(listId: string, items: string[]) {
    if (!listId || !items || items.length === 0) return of({});
    let url = this.ENDPOINT + listId + '/bulkitemdel';
    const payload = { itemList: items };
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteList(listId: string) {
    let url = this.ENDPOINT + listId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  shareList(listId: string, recipientId: string) {
    if( ! listId || ! recipientId ) return of(null);
    let url = this.ENDPOINT + 'share/' + listId + "/recipient/" + recipientId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  acceptList(notificationId: string) {
    if( ! notificationId ) return of(null);
    let url = this.ENDPOINT + 'accept/' + notificationId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduList) {
    this.details.next(details);
  }
}
