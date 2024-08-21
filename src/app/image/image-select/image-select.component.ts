import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { WotlweduImage } from "../../datamodel/wotlwedu-image.model";
import { ImageDataService } from "../../service/imagedata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduUser } from "../../datamodel/wotlwedu-user.model";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-image-select",
  templateUrl: "./image-select.component.html",
  styleUrl: "./image-select.component.css",
})
export class ImageSelectComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  images: WotlweduImage[];
  imagesSub: Subscription;
  filterText: string = "";
  imageData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  friendMiniVisible: boolean = false;
  private _pendingShare: string = null;
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  // Context Menu properties
  private shareContextOptions: WotlweduContextOption[] = [
    {
      name: "Share",
      enabled: true,
      cb: this.shareImageAction.bind(this),
    },
  ];

  private deleteContextOptions: WotlweduContextOption[] = [
    {
      name: "Delete",
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private imageDataService: ImageDataService,
    private dataSignalService: DataSignalService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.filter.setService(this.imageDataService);
    this.pages.setService(this.imageDataService);
    this.imagesSub = this.imageDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (items) => {
        this.images = items;
        this.images.forEach((x) => {
          x.isAvailable = true;
        });
        this.loader.stop();
        this.pages.updatePages();
      },
    });
    this.imageDataService.reset();
  }

  ngOnDestroy() {
    this.imagesSub.unsubscribe();
  }

  onSelect(index: number) {
    this.imageDataService.setData(this.images[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "image", this.images[index].id]);
  }

  onContextMenu(event, index: number) {
    let menuOptions = [];
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.images[index].id);

    menuOptions = menuOptions.concat(this.shareContextOptions);
    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);
    menuOptions = menuOptions.concat(this.deleteContextOptions);

    /* Toggle the read/unread option */
    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  shareImageAction(object: any) {
    this._pendingShare = object.id;
    this.friendMiniVisible = true;
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.deleteImage.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object.id);
    this.confirmDialog.show();
  }

  onFriendMiniClose() {
    this.friendMiniVisible = false;
  }

  dialogNoClick(object) {
    this.confirmDialog.hide();
    this._pendingShare = null;
  }

  onFriendSelect(event: WotlweduUser) {
    this.confirmDialog.setYesAction(this.shareImage.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage(
      "Are you sure you want to share an image with " + event.fullName + "?"
    );
    this.confirmDialog.setObjectData({
      imageId: this._pendingShare,
      userId: event.id,
    });
    this.confirmDialog.show();
  }

  shareImage(object: any) {
    this.loader.start();
    this.imageDataService.shareImage(object.imageId, object.userId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
      },
    });
  }

  deleteImage(object: any) {
    this.loader.start();
    this.imageDataService.deleteImage(object).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.imageDataService.setData(null);
        this.imageDataService.getAllData();
        this.loader.stop();
      },
    });
  }

  onClickAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "image", "add"]);
  }

  onCancel() {
    this.pageStack.back();
  }
}
