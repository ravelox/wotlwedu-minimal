import { Component, OnDestroy, OnInit } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { WotlweduList } from "../../datamodel/wotlwedu-list.model";
import { ListDataService } from "../../service/listdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduUser } from "../../datamodel/wotlwedu-user.model";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-list-select",
  templateUrl: "./list-select.component.html",
  styleUrl: "./list-select.component.css",
})
export class ListSelectComponent implements OnInit, OnDestroy {
  lists: WotlweduList[];
  listsSub: Subscription;
  listData = new BehaviorSubject<any>(null);
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  friendMiniVisible: boolean = false;
  private _pendingShare: string = null;
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  // Context Menu properties
  private shareContextOptions: WotlweduContextOption[] = [
    {
      name: "Share",
      enabled: true,
      cb: this.shareListAction.bind(this),
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
    private listDataService: ListDataService,
    private dataSignalService: DataSignalService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.pages.setService(this.listDataService);
    this.filter.setService(this.listDataService);
    this.listsSub = this.listDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (lists) => {
        this.loader.stop();
        this.lists = lists;
        this.lists.forEach((x) => {
          x.isAvailable = true;
        });
        this.pages.updatePages();
      },
    });
    this.loader.stop();
  }

  ngOnDestroy() {
    this.listsSub.unsubscribe();
  }

  onSelect(index: number) {
    this.listDataService.setData(this.lists[index]);
    this.pageStack.savePage();
    this.router.navigate(["/", "list", this.lists[index].id]);
  }

  onContextMenu(event, index: number) {
    let menuOptions = [];
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.lists[index].id);

    menuOptions = menuOptions.concat(this.shareContextOptions);
    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);
    menuOptions = menuOptions.concat(this.deleteContextOptions);

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  shareListAction(object: any) {
    this._pendingShare = object.id;
    this.friendMiniVisible = true;
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.deleteList.bind(this));
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
    this.confirmDialog.setYesAction(this.shareList.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage(
      "Are you sure you want to share a list with " + event.fullName + "?"
    );
    this.confirmDialog.setObjectData({
      listId: this._pendingShare,
      userId: event.id,
    });
    this.confirmDialog.show();
  }

  shareList(object: any) {
    this.loader.start();
    this.listDataService.shareList(object.listId, object.userId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
      },
    });
  }

  deleteList(object: any) {
    this.loader.start();
    this.listDataService.deleteList(object).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.listDataService.setData(null);
        this.listDataService.getAllData();
      },
    });
  }

  onCancel() {
    this.loader.stop();
    this.pageStack.back();
  }

  onAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "list", "add"]);
  }
}
