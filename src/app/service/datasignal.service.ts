import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';
import { WotlweduNotificationEvent } from '../datamodel/wotlwedu-notification-constants';

@Injectable({ providedIn: 'root' })
export class DataSignalService {
  dialogCloseSignal = new Subject<boolean>();
  refreshDataSignal = new Subject<boolean>();
  isErrorSignal = new Subject<boolean>();
  hasNotificationSignal = new Subject<WotlweduNotificationEvent | null>();

  constructor() {}

  /* Generic function to signal to all context controllers to hide */
  closeDialog() {
    this.dialogCloseSignal.next(true);
  }

  refreshData() {
    this.refreshDataSignal.next(true);
  }

  isError() {
    this.isErrorSignal.next(true);
  }

  clearError(){
    this.isErrorSignal.next(false);
  }

  hasNotification(event?: WotlweduNotificationEvent | null) {
    this.hasNotificationSignal.next(event || null);
  }
}
