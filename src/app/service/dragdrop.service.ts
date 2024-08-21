import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DragAndDropService {
  objectPickedUp: any;
  inProgress: boolean = false;
  dropDetect = new Subject<any>();

  constructor() {
    this.objectPickedUp = null;
    this.inProgress = false;
  }

  pickUp(object) {
    if (!this.inProgress) {
      this.objectPickedUp = object;
      this.inProgress = true;
      this.dropDetect.next({ status: false, target: '' });
    }
  }

  drop(sender?: string) {
    if (this.inProgress) {
      this.dropDetect.next({ status: true, target: sender, object: this.objectPickedUp });
    }
  }

  reset() {
    this.objectPickedUp = null;
    this.inProgress = false;
  }
}
