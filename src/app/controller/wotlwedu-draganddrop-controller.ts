import { Subscription } from 'rxjs';
import { DragAndDropService } from '../service/dragdrop.service';

export class WotlweduDragAndDropController {
  private _service: any;
  private _cb: Function = null;
  private _listName: string;
  private _dropSub: Subscription;

  constructor(private dragAndDropService: DragAndDropService) {}

  setDropCallback(cb: Function) {
    this._cb = cb;
  }

  setListName(listName: string) {
    this._listName = listName;
  }

  onDragStart(event, type) {
    const name = event.srcElement.dataset.value
      ? event.srcElement.dataset.value
      : event.srcElement.innerText;

    const objectDetails = {
      type: type,
      id: event.srcElement.dataset.id,
      name: name,
      source: event.srcElement.dataset.source,
    };
    this.dragAndDropService.pickUp(objectDetails);

    /*
    To enable deletion by dragging outside the source component, we need to know where the 
    drop is going to end up. The main container for this component has the (drop) event
    enabled and will notify this subscription through the DragAndDropService
    */
    this._dropSub = this.dragAndDropService.dropDetect.subscribe(
      (response) => {
        if (response.status === true) {
          this._dropSub.unsubscribe();
          if (response.target !== this._listName) {
            const droppedItem = response.object;
            if (this._cb) this._cb(droppedItem.id);
          }
          this.dragAndDropService.reset();
        }
      }
    );
  }

  onDrop(event) {
    this.dragAndDropService.drop();
  }

  onDropSelf() {
    this.dragAndDropService.reset();
  }

  onDragOver(event) {
    event.preventDefault();
  }

  unsub() {
    if (this._dropSub) this._dropSub.unsubscribe();
  }
}
