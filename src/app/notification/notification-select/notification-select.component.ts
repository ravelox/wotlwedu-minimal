import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

import { NotificationDataService } from "../../service/notificationdata.service";
import { WotlweduNotification } from "../../datamodel/wotlwedu-notification.model";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { UserDataService } from "../../service/userdata.service";
import { DataSignalService } from "../../service/datasignal.service";
import { ImageDataService } from "../../service/imagedata.service";
import { ListDataService } from "../../service/listdata.service";
import { ItemDataService } from "../../service/itemdata.service";
import { WotlweduViewerController } from "../../controller/wotlwedu-viewer-controller.class";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import {
  NOTIFICATION_STATUS,
  NOTIFICATION_TYPE,
} from "../../datamodel/wotlwedu-notification-constants";

@Component({
  selector: "app-notification-select",
  templateUrl: "./notification-select.component.html",
  styleUrl: "./notification-select.component.css",
})
export class NotificationSelectComponent implements OnInit, OnDestroy {
  notifications: WotlweduNotification[] = [];
  notificationSub: Subscription;
  contextMenu: WotlweduContextController = new WotlweduContextController();
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  listViewer: WotlweduViewerController = new WotlweduViewerController();
  itemViewer: WotlweduViewerController = new WotlweduViewerController();
  imageViewer: WotlweduViewerController = new WotlweduViewerController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  private voteContextOptions: WotlweduContextOption[] = [
    { name: "Vote", enabled: true, cb: this.getVoteFromNotification.bind(this) },
  ];
  private electionContextOptions: WotlweduContextOption[] = [
    {
      name: "View Statistics",
      enabled: true,
      cb: this.viewElectionStatistics.bind(this),
    },
    {
      name: "View Election Details",
      enabled: true,
      cb: this.viewElectionDetails.bind(this),
    },
  ];
  private friendContextOptions: WotlweduContextOption[] = [
    {
      name: "Accept Friend Request",
      enabled: true,
      cb: this.acceptFriendRequest.bind(this),
    },
    {
      name: "Block",
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private imageShareContextOptions: WotlweduContextOption[] = [
    { name: "View Image", enabled: true, cb: this.viewImage.bind(this) },
    { name: "Accept Image", enabled: true, cb: this.acceptImageShare.bind(this) },
    {
      name: "Block Sender",
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private itemShareContextOptions: WotlweduContextOption[] = [
    { name: "View Item", enabled: true, cb: this.viewItem.bind(this) },
    { name: "Accept Item", enabled: true, cb: this.acceptItemShare.bind(this) },
    {
      name: "Block Sender",
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private listShareContextOptions: WotlweduContextOption[] = [
    { name: "View List", enabled: true, cb: this.viewList.bind(this) },
    { name: "Accept List", enabled: true, cb: this.acceptListShare.bind(this) },
    {
      name: "Block Sender",
      enabled: true,
      cb: this.showBlockConfirmationDialog.bind(this),
    },
  ];
  private markAsReadOptions: WotlweduContextOption[] = [
    { name: "Mark as Read", enabled: true, cb: this.markAsRead.bind(this) },
  ];
  private markAsUnreadOptions: WotlweduContextOption[] = [
    { name: "Mark as Unread", enabled: true, cb: this.markAsUnread.bind(this) },
  ];
  private defaultContextOptions: WotlweduContextOption[] = [
    {
      name: "Delete",
      enabled: true,
      cb: this.showDeleteConfirmationDialog.bind(this),
    },
  ];

  constructor(
    private notificationDataService: NotificationDataService,
    private userDataService: UserDataService,
    private imageDataService: ImageDataService,
    private itemDataService: ItemDataService,
    private listDataService: ListDataService,
    private dataSignalService: DataSignalService,
    private router: Router,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.contextMenu.setService(this.dataSignalService);
    this.loader.start();
    this.notificationSub = this.notificationDataService.dataChanged.subscribe(
      (notifications) => {
        this.notifications = notifications || [];
        this.loader.stop();
      }
    );

    this.notificationDataService.loadPage().subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
    });
    this.notificationDataService.refreshUnreadCount();
  }

  ngOnDestroy() {
    if (this.notificationSub) this.notificationSub.unsubscribe();
  }

  showDeleteConfirmationDialog(object: WotlweduNotification) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  showBlockConfirmationDialog(object: WotlweduNotification) {
    this.confirmDialog.setYesAction(this.dialogBlockYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogBlockNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure you want to block this user?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogBlockYesClick(object: WotlweduNotification) {
    this.blockUser(object);
    this.confirmDialog.hide();
  }

  dialogBlockNoClick(object: WotlweduNotification) {
    this.confirmDialog.hide();
  }

  dialogDeleteYesClick(object: WotlweduNotification) {
    this.deleteNotification(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: WotlweduNotification) {
    this.confirmDialog.hide();
  }

  viewElectionStatistics(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.markAsRead(object, true);
    this.pageStack.savePage();
    this.router.navigate(["/", "statistics", object.objectId]);
  }

  viewElectionDetails(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.markAsRead(object, true);
    this.pageStack.savePage();
    this.router.navigate(["/", "election", object.objectId]);
  }

  acceptImageShare(object: WotlweduNotification) {
    if (!object?.id) return;
    this.loader.start();
    this.imageDataService.acceptImage(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.notificationDataService.removeLocalNotification(object.id);
        this.notificationDataService.refreshUnreadCount();
        this.dataSignalService.refreshData();
        this.loader.stop();
      },
    });
  }

  acceptItemShare(object: WotlweduNotification) {
    if (!object?.id) return;
    this.loader.start();
    this.itemDataService.acceptItem(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.notificationDataService.removeLocalNotification(object.id);
        this.notificationDataService.refreshUnreadCount();
        this.dataSignalService.refreshData();
        this.loader.stop();
      },
    });
  }

  acceptListShare(object: WotlweduNotification) {
    if (!object?.id) return;
    this.loader.start();
    this.listDataService.acceptList(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.notificationDataService.removeLocalNotification(object.id);
        this.notificationDataService.refreshUnreadCount();
        this.dataSignalService.refreshData();
        this.loader.stop();
      },
    });
  }

  acceptFriendRequest(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.loader.start();
    this.userDataService.confirmFriend(object.objectId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.deleteNotification(object, false);
        this.dataSignalService.refreshData();
        this.loader.stop();
      },
    });
  }

  blockUser(object: WotlweduNotification) {
    if (!object?.sender?.id) return;
    this.loader.start();
    this.userDataService.blockFriend(object.sender.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.deleteNotification(object, false);
        this.dataSignalService.refreshData();
        this.loader.stop();
      },
    });
  }

  getVoteFromNotification(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.markAsRead(object, true);
    this.pageStack.savePage();
    this.router.navigate(["/", "cast-vote", object.objectId]);
  }

  deleteNotification(object: WotlweduNotification, startLoader: boolean = true) {
    if (!object?.id) return;
    if (startLoader) this.loader.start();
    this.notificationDataService.deleteNotification(object.id).subscribe({
      error: (err) => {
        if (startLoader) this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.dataSignalService.refreshData();
        if (startLoader) this.loader.stop();
      },
    });
  }

  markAsRead(object: WotlweduNotification, background: boolean = false) {
    if (!object?.id || +object?.status?.id === NOTIFICATION_STATUS.read) return;
    if (!background) this.loader.start();
    this.notificationDataService.markRead(object.id).subscribe({
      error: (err) => {
        if (!background) this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        if (!background) this.loader.stop();
      },
    });
  }

  markAsUnread(object: WotlweduNotification) {
    if (!object?.id || +object?.status?.id === NOTIFICATION_STATUS.unread) return;
    this.loader.start();
    this.notificationDataService.markUnread(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.loader.stop();
      },
    });
  }

  onSelect(index: number) {
    this.notificationDataService.setData(this.notifications[index]);
  }

  onContextMenu(event, index: number) {
    let menuOptions: WotlweduContextOption[] = [];
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.notifications[index].id);

    switch (this.notifications[index].type) {
      case NOTIFICATION_TYPE.electionStart:
        menuOptions = this.voteContextOptions;
        break;
      case NOTIFICATION_TYPE.friendRequest:
        menuOptions = this.friendContextOptions;
        break;
      case NOTIFICATION_TYPE.shareImage:
        menuOptions = this.imageShareContextOptions;
        break;
      case NOTIFICATION_TYPE.shareItem:
        menuOptions = this.itemShareContextOptions;
        break;
      case NOTIFICATION_TYPE.shareList:
        menuOptions = this.listShareContextOptions;
        break;
      case NOTIFICATION_TYPE.electionEnd:
      case NOTIFICATION_TYPE.electionExpired:
        menuOptions = this.electionContextOptions;
        break;
    }

    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);
    menuOptions = menuOptions.concat(
      +this.notifications[index].status?.id === NOTIFICATION_STATUS.unread
        ? this.markAsReadOptions
        : this.markAsUnreadOptions
    );
    menuOptions = menuOptions.concat(this.defaultContextOptions);
    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  viewList(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.listViewer.setDataId(object.objectId);
    this.listViewer.setExtra(object.id);
    this.listViewer.show();
    this.markAsRead(object, true);
  }

  onCloseListViewer() {
    this.listViewer.hide();
  }

  viewItem(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.itemViewer.setDataId(object.objectId);
    this.itemViewer.setExtra(object.id);
    this.itemViewer.show();
    this.markAsRead(object, true);
  }

  onCloseItemViewer() {
    this.itemViewer.hide();
  }

  viewImage(object: WotlweduNotification) {
    if (!object?.objectId) return;
    this.imageViewer.setDataId(object.objectId);
    this.imageViewer.setExtra(object.id);
    this.imageViewer.show();
    this.markAsRead(object, true);
  }

  onCloseImageViewer() {
    this.imageViewer.hide();
  }

  onCancel() {
    this.pageStack.back();
  }
}
