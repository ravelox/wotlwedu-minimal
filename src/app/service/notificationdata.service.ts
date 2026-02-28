import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { WotlweduNotification } from "../datamodel/wotlwedu-notification.model";
import { WotlweduPagination } from "../datamodel/wotlwedu-pagination.model";
import {
  NOTIFICATION_STATUS,
  WotlweduNotificationEvent,
} from "../datamodel/wotlwedu-notification-constants";
import { ConfigService } from "./config.service";
import { DataSignalService } from "./datasignal.service";

@Injectable({ providedIn: "root" })
export class NotificationDataService extends WotlweduPagination {
  private notificationsSubject = new BehaviorSubject<WotlweduNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  dataChanged = this.notificationsSubject.asObservable();
  unreadCountChanged = this.unreadCountSubject.asObservable();
  details = new BehaviorSubject<WotlweduNotification | null>(null);

  constructor(
    private http: HttpClient,
    private configService: ConfigService,
    private dataSignalService: DataSignalService
  ) {
    super();
    this.page = 1;
    this.itemsPerPage = 25;
    this.total = 0;
    this.setCallbackFunction(() => this.refresh());
    this.dataSignalService.hasNotificationSignal.subscribe({
      next: (event) => this.applySocketEvent(event),
    });
  }

  get notifications(): WotlweduNotification[] {
    return this.notificationsSubject.value;
  }

  get unreadCount(): number {
    return this.unreadCountSubject.value;
  }

  loadPage(page: number = this.page || 1, items: number = this.itemsPerPage || 25) {
    const url = this.configService.config.apiUrl + "notification/";
    return this.http
      .get<WotlweduApiResponse>(url, {
        params: {
          page: String(page),
          items: String(items),
        },
      })
      .pipe(
        tap((response) => {
          const objects: WotlweduNotification[] = response?.data?.notifications || [];
          this.page = response?.data?.page || page;
          this.total = response?.data?.total || 0;
          this.itemsPerPage = response?.data?.itemsPerPage || items;
          this.notificationsSubject.next(objects.slice());
        })
      );
  }

  refresh() {
    return this.loadPage().subscribe();
  }

  getUnreadCount() {
    const url = this.configService.config.apiUrl + "notification/unreadcount";
    return this.http.get<WotlweduApiResponse>(url).pipe(
      tap((response) => {
        const unread = +(response?.data?.unread ?? 0);
        this.unreadCountSubject.next(unread);
      }),
      map((response) => +(response?.data?.unread ?? 0))
    );
  }

  refreshUnreadCount() {
    return this.getUnreadCount().subscribe();
  }

  saveNotification(notifObject: WotlweduNotification) {
    const payload = {
      userId: notifObject.user?.id,
      senderId: notifObject.sender?.id,
      text: notifObject.text,
      type: notifObject.type,
      statusId: notifObject.status?.id,
      objectId: notifObject.objectId,
    };
    let url = this.configService.config.apiUrl + "notification/";

    if (notifObject.id) {
      url = url + notifObject.id;
      return this.http.put<WotlweduApiResponse>(url, payload).pipe(
        tap((response) => {
          const notification = response?.data?.notification;
          if (notification) {
            this.upsertLocalNotification(notification);
          }
        })
      );
    }
    return this.http.post<WotlweduApiResponse>(url, payload).pipe(
      tap((response) => {
        const notification = response?.data?.notification;
        if (notification) {
          this.upsertLocalNotification(notification, true);
        }
      })
    );
  }

  deleteNotification(notificationId: string) {
    const url = this.configService.config.apiUrl + "notification/" + notificationId;
    const current = this.findById(notificationId);
    return this.http.delete<WotlweduApiResponse>(url).pipe(
      tap(() => {
        this.removeLocalNotification(notificationId);
        if (+current?.status?.id === NOTIFICATION_STATUS.unread) {
          this.setUnreadCount(Math.max(0, this.unreadCount - 1));
        }
      })
    );
  }

  setData(details: WotlweduNotification) {
    this.details.next(details);
  }

  setStatus(notificationId: string, statusId: number) {
    if (!statusId) {
      return of(null);
    }

    const notifUrl =
      this.configService.config.apiUrl +
      "notification/status/" +
      notificationId +
      "/" +
      statusId;

    return this.http.put<WotlweduApiResponse>(notifUrl, {}).pipe(
      tap((response) => {
        const updatedNotification = response?.data?.notification;
        if (updatedNotification) {
          this.upsertLocalNotification(updatedNotification);
          this.syncUnreadCountFromNotifications();
        } else {
          this.patchLocalStatus(notificationId, statusId);
        }
      })
    );
  }

  markRead(notificationId: string) {
    return this.setStatus(notificationId, NOTIFICATION_STATUS.read);
  }

  markUnread(notificationId: string) {
    return this.setStatus(notificationId, NOTIFICATION_STATUS.unread);
  }

  removeLocalNotification(notificationId: string) {
    this.notificationsSubject.next(
      this.notifications.filter((notification) => notification.id !== notificationId)
    );
  }

  upsertLocalNotification(notification: WotlweduNotification, prepend: boolean = false) {
    if (!notification || !notification.id) return;

    const nextNotifications = this.notifications.slice();
    const index = nextNotifications.findIndex((x) => x.id === notification.id);
    if (index >= 0) {
      nextNotifications[index] = {
        ...nextNotifications[index],
        ...notification,
      };
    } else if (prepend) {
      nextNotifications.unshift(notification);
    } else {
      nextNotifications.unshift(notification);
    }

    this.notificationsSubject.next(nextNotifications);
  }

  applySocketEvent(event: WotlweduNotificationEvent | null) {
    if (!event) {
      this.refreshUnreadCount();
      return;
    }

    if (typeof event.unreadCount === "number") {
      this.setUnreadCount(event.unreadCount);
    }

    switch (event.kind) {
      case "created":
        if (event.notification) {
          this.upsertLocalNotification(event.notification, true);
        } else {
          this.refresh();
        }
        break;
      case "updated":
        if (event.notification) {
          this.upsertLocalNotification(event.notification);
        } else if (event.notificationId) {
          this.refresh();
        }
        break;
      case "deleted":
        if (event.notificationId) {
          this.removeLocalNotification(event.notificationId);
        }
        break;
      default:
        this.refresh();
        break;
    }
  }

  private findById(notificationId: string) {
    return this.notifications.find((notification) => notification.id === notificationId);
  }

  private patchLocalStatus(notificationId: string, statusId: number) {
    const nextNotifications = this.notifications.map((notification) => {
      if (notification.id !== notificationId) return notification;
      return {
        ...notification,
        status: {
          ...(notification.status || {}),
          id: String(statusId),
          name:
            statusId === NOTIFICATION_STATUS.unread
              ? "Unread"
              : statusId === NOTIFICATION_STATUS.read
                ? "Read"
                : notification.status?.name,
          object: notification.status?.object || "notification",
        },
      };
    });

    this.notificationsSubject.next(nextNotifications);
    this.syncUnreadCountFromNotifications();
  }

  private syncUnreadCountFromNotifications() {
    const unread = this.notifications.filter(
      (notification) => +notification?.status?.id === NOTIFICATION_STATUS.unread
    ).length;

    if (this.total > this.notifications.length) {
      this.refreshUnreadCount();
      return;
    }

    this.setUnreadCount(unread);
  }

  private setUnreadCount(unread: number) {
    this.unreadCountSubject.next(Math.max(0, unread || 0));
  }
}
