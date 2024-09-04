import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataSignalService {
  dialogCloseSignal = new Subject<boolean>();
  refreshDataSignal = new Subject<boolean>();
  isErrorSignal = new Subject<boolean>();
  hasNotificationSignal = new Subject<boolean>();

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

  hasNotification() {
    this.hasNotificationSignal.next(true);
  }
}
