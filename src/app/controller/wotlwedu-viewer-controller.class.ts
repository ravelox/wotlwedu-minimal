export class WotlweduViewerController {
  isVisible: boolean = false;
  id: string = null;
  extra: any = null;

  constructor() {}

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  setDataId(id: string) {
    if (!id) return;
    this.id = id;
  }

  setExtra( extra: any) {
    this.extra = extra;
  }

  onClose() {
    this.hide();
  }
}
