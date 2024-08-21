import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { WotlweduItem } from "../../datamodel/wotlwedu-item.model";
import { ItemDataService } from "../../service/itemdata.service";
import { DragAndDropService } from "../../service/dragdrop.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduPages } from "../../controller/wotlwedu-pagination-controller.class";
import { WotlweduFilterController } from "../../controller/wotlwedu-filter-controller";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { WotlweduUser } from "../../datamodel/wotlwedu-user.model";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-item-select",
  templateUrl: "./item-select.component.html",
  styleUrl: "./item-select.component.css",
})
export class ItemSelectComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() selectMode: boolean = false;
  @Input() allowAdd: boolean = true;
  items: WotlweduItem[];
  itemsSub: Subscription;
  itemData = new BehaviorSubject<any>(null);
  listName: string = "itemselect";
  alertBox: WotlweduAlert = new WotlweduAlert();
  pages: WotlweduPages = new WotlweduPages();
  filter: WotlweduFilterController = new WotlweduFilterController();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  @ViewChild("itemselectlist") itemSelectList: ElementRef;
  private _pendingShare: string = null;
  friendMiniVisible: boolean = false;
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  refreshSub: Subscription;

  // Context Menu properties
  private shareContextOptions: WotlweduContextOption[] = [
    {
      name: "Share",
      enabled: true,
      cb: this.shareItemAction.bind(this),
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
    private itemDataService: ItemDataService,
    private dataSignalService: DataSignalService,
    private router: Router,
    private pageStack: WotlweduPageStackService,
    private selectionService: WotlweduSelectionService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pages.setService(this.itemDataService);
    this.filter.setService(this.itemDataService);
    this.itemsSub = this.itemDataService.dataChanged.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (items) => {
        this.items = items;
        this.refreshData();
        this.pages.updatePages();
        this.loader.stop();
      },
    });
    this.refreshSub = this.dataSignalService.refreshDataSignal.subscribe({
      next: () => {
        this.refreshData();
      },
    });
    this.loader.stop();
  }

  ngAfterViewInit(): void {
    this.pageStack.setRouter(this.router);
    if (this.selectMode) {
      this.itemSelectList.nativeElement.style.height = "50svh";
    }
  }

  ngOnDestroy() {
    this.itemsSub.unsubscribe();
  }

  refreshData() {
    if(! this.items ) return;
    this.items.forEach((x) => {
      x.isAvailable = true;
      if (this.selectMode) {
        x.isSelected = this.selectionService.find(x.id) ? true : false;
      }
    });
  }

  onSelect(index: number) {
    if (this.selectMode === true) {
      this.items[index].isSelected = !this.items[index].isSelected;
      if (this.items[index].isSelected) {
        this.selectionService.push("item", this.items[index].id);
      } else {
        this.selectionService.removeId(this.items[index].id);
      }
    } else {
      this.itemDataService.setData(this.items[index]);
      this.pageStack.savePage();
      this.router.navigate(["/", "item", this.items[index].id]);
    }
  }

  onContextMenu(event, index: number) {
    let menuOptions = [];
    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);
    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.items[index].id);

    menuOptions = menuOptions.concat(this.shareContextOptions);
    menuOptions = menuOptions.concat(this.contextMenu.separatorOption);
    menuOptions = menuOptions.concat(this.deleteContextOptions);

    /* Toggle the read/unread option */
    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }

  shareItemAction(object: any) {
    this._pendingShare = object.id;
    this.friendMiniVisible = true;
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.deleteItem.bind(this));
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
    this.confirmDialog.setYesAction(this.shareItem.bind(this));
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage(
      "Are you sure you want to share an item with " + event.fullName + "?"
    );
    this.confirmDialog.setObjectData({
      imageId: this._pendingShare,
      userId: event.id,
    });
    this.confirmDialog.show();
  }

  shareItem(object: any) {
    this.loader.start();
    this.itemDataService.shareItem(object.imageId, object.userId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
      },
    });
  }

  deleteItem(object: any) {
    this.loader.start();
    this.itemDataService.deleteItem(object).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.itemDataService.setData(null);
        this.itemDataService.getAllData();
        this.loader.stop();
      },
    });
  }

  onClickAdd() {
    this.pageStack.savePage();
    this.router.navigate(["/", "item", "add"]);
  }

  onCancel() {
    this.pageStack.back();
  }
}
