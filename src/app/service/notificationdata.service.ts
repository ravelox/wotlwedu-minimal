import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { of, Subject } from 'rxjs';
import { GlobalVariable } from '../global';
import { WotlweduNotification } from '../datamodel/wotlwedu-notification.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class NotificationDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduNotification[]>();
  details = new Subject<WotlweduNotification>();
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'notification/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(notificationId: string) {
    if (!notificationId || notificationId === '') return null;
    const url = this.ENDPOINT + notificationId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData() {
    const url = this.ENDPOINT;
    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduNotification[] = response.data.notifications;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  getUnreadCount() {
    const url = this.ENDPOINT + "unreadcount";
    return this.http.get<WotlweduApiResponse>(url);
  }

  saveNotification(notifObject: WotlweduNotification) {
    const payload = {
      userId: notifObject.user.id,
      senderId: notifObject.sender.id,
      text: notifObject.text,
      type: notifObject.type,
      statusId: notifObject.status.id,
    };
    let url = this.ENDPOINT;

    if (notifObject.id) {
      url = url + notifObject.id;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteNotification(notificationId: string) {
    let url = this.ENDPOINT + notificationId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduNotification) {
    this.details.next(details);
  }

  setStatus(notificationId: string, statusName: string) {
    const statusId = 10;

    const foundStatus = this.sharedDataService.getStatusId(statusName);
    if (foundStatus) {
      const notifUrl =
        this.ENDPOINT +
        'status/' +
        notificationId +
        '/' +
        foundStatus;

      return this.http.put<WotlweduApiResponse>(notifUrl, {});
    } else {
      return of(null);
    }
  }
}
