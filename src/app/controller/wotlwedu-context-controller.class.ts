/*
Created this based on the answers at
https://stackoverflow.com/questions/4909167/how-to-add-a-custom-right-click-menu-to-a-webpage 
*/

import { WotlweduContextOption } from '../datamodel/wotlwedu-context-option.model';

export class WotlweduContextController {
  options: WotlweduContextOption[];
  showMenu: boolean;
  top: number = 0;
  left: number = 0;
  objectId: string = null;
  objectData: any = null;
  private _service: any;

  private _separatorOption: WotlweduContextOption[] = [
    {
      name: '_hr_',
      enabled: false,
      cb: null,
    },
  ];

  constructor() {
    this.options = [];
    this.showMenu = false;
  }
  get separatorOption() {
    return this._separatorOption;
  }

  setService(service) {
    this._service = service;
  }

  mouseX(event) {
    if (event.pageX) {
      return event.pageX;
    } else if (event.clientX) {
      return (
        event.clientX +
        (document.documentElement.scrollLeft
          ? document.documentElement.scrollLeft
          : document.body.scrollLeft)
      );
    } else {
      return null;
    }
  }

  mouseY(event) {
    if (event.pageY) {
      return event.pageY;
    } else if (event.clientY) {
      return (
        event.clientY +
        (document.documentElement.scrollTop
          ? document.documentElement.scrollTop
          : document.body.scrollTop)
      );
    } else {
      return null;
    }
  }

  hide() {
    this.showMenu = false;
  }

  /* Delay the variable set for 1 microsecond
  otherwise the context menu will not be displayed
  in response to another contextmenu event */
  show() {
    setTimeout(() => (this.showMenu = true), 1);
  }

  closeDown() {
    if (this._service) {
      this._service.closeDialog();
    }
  }

  getMousePosition(event) {
    this.top = this.mouseY(event);
    this.left = this.mouseX(event);
  }

  setObjectId(id: string) {
    this.objectId = id;
  }

  setObjectData( data: any) {
    this.objectData = data;
  }

  setOptions(options: WotlweduContextOption[]) {
    this.options = options;
  }
}
