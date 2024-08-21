import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { UserDataService } from "../../service/userdata.service";
import { Subscription } from "rxjs";
import { WotlweduFriend } from "../../datamodel/wotlwedu-friend.model";
import { AuthDataService } from "../../service/authdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduContextController } from "../../controller/wotlwedu-context-controller.class";
import { WotlweduContextOption } from "../../datamodel/wotlwedu-context-option.model";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

class WotlweduSelectionData {
  type: string;
  id: string;
}

@Component({
  selector: "app-friend-select",
  templateUrl: "./friend-select.component.html",
  styleUrl: "./friend-select.component.css",
})
export class FriendSelectComponent implements OnInit, OnDestroy, AfterViewInit {
  currentFriends: WotlweduFriend[];
  authSub: Subscription;
  refreshSub: Subscription;
  userId: string = null;
  @Input() allowAdd: boolean = true;
  @Input() selectMode: boolean = false;
  addFriend: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  listName: string = "friendlist";
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  contextMenu: WotlweduContextController = new WotlweduContextController();
  private showBlocked: boolean = false;
  @ViewChild("friendselectlist") friendSelectList: ElementRef;
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  // Context Menu properties
  private removeRequestContextOptions: WotlweduContextOption[] = [
    {
      name: "Remove Request",
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
  ];

  private unfriendContextOptions: WotlweduContextOption[] = [
    {
      name: "Unfriend",
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
    {
      name: "Unfriend And Block",
      enabled: true,
      cb: this.confirmUnfriendAndBlock.bind(this),
    },
  ];

  private unblockContextOptions: WotlweduContextOption[] = [
    {
      name: "Unblock",
      enabled: true,
      cb: this.confirmDeleteRelationship.bind(this),
    },
    {
      name: "Unblock and Send Request",
      enabled: true,
      cb: this.confirmUnblockAndRequest.bind(this),
    },
  ];

  constructor(
    private userDataService: UserDataService,
    private authDataService: AuthDataService,
    private dataSignalService: DataSignalService,
    private selectionService: WotlweduSelectionService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit(): void {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.updateFriendsList(this.showBlocked);
    this.authSub = this.authDataService.authData.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (authdata) => {
        if (authdata) {
          this.userId = authdata.id;
          this.updateFriendsList(this.showBlocked);
        }
        this.loader.stop();
      },
    });
    this.refreshSub = this.dataSignalService.refreshDataSignal.subscribe({
      next: () => this.refreshData(),
    });
    this.updateFriendsList(this.showBlocked);
  }

  ngAfterViewInit(): void {
    if (this.selectMode) {
      this.friendSelectList.nativeElement.style.height = "50svh";
    }
    this.updateFriendsList(this.showBlocked);
  }
  confirmUnblockAndRequest(object: any) {
    this.confirmDialog.setYesAction(this.unblockAndRequest.bind(this));
    this.showConfirmationDialog(object);
  }

  confirmUnfriendAndBlock(object: any) {
    this.confirmDialog.setYesAction(this.unfriendAndBlock.bind(this));
    this.showConfirmationDialog(object);
  }

  confirmDeleteRelationship(object: any) {
    this.confirmDialog.setYesAction(this.deleteRelationship.bind(this));
    this.showConfirmationDialog(object);
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setNoAction(this.dialogNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogNoClick(object: any) {
    this.confirmDialog.hide();
  }

  deleteRelationship(object: any) {
    if (!object || !object.id) return;
    this.loader.start();
    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  blockByUserId(userId: string) {
    if (!userId) return;
    this.loader.start();
    this.userDataService.blockFriend(userId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  unfriendAndBlock(object: any) {
    if (!object || !object.id) return;
    this.loader.start();
    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        if (response && response.data && response.data.friend) {
          this.blockByUserId(response.data.friend);
        } else {
          this.updateFriendsList(this.showBlocked);
        }
      },
    });
  }

  makeFriendRequestById(friendId: string) {
    if (!friendId) return;
    this.loader.start();
    this.userDataService.addFriendById(friendId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.updateFriendsList(this.showBlocked);
      },
    });
  }

  unblockAndRequest(object: any) {
    if (!object || !object.id) return;
    this.loader.start();
    this.userDataService.deleteRelationship(object.id).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        if (response && response.data && response.data.friend) {
          this.makeFriendRequestById(response.data.friend);
        } else {
          this.updateFriendsList(this.showBlocked);
        }
      },
    });
  }

  updateFriendsList(showBlocked: boolean) {
    if (this.userId) {
      this.loader.start();
      this.userDataService.getFriends(this.userId, showBlocked).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (friendsResponse) => {
          if (
            friendsResponse &&
            friendsResponse.data &&
            friendsResponse.data.friends
          ) {
            this.currentFriends = friendsResponse.data.friends;
            this.refreshData();
            this.loader.stop();
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.authSub) this.authSub.unsubscribe();
  }

  onClickAdd() {
    this.addFriend = true;
  }

  onCloseAdd() {
    this.addFriend = false;
  }

  refreshData() {
    if( ! this.currentFriends ) return;
    for (let u of this.currentFriends) {
      u.isAvailable = u.status.name.toLowerCase() === "friend";
      if (this.selectMode) {
        if (u && u.user && u.user.id) {
          u.isSelected = this.selectionService.find(u.user.id) ? true : false;
        }
      }
    }
  }
  onSelect(index: number) {
    if (this.selectMode === true) {
      this.currentFriends[index].isSelected =
        !this.currentFriends[index].isSelected;
      if (this.currentFriends[index].isSelected) {
        this.selectionService.push("user", this.currentFriends[index].user.id);
      } else {
        this.selectionService.removeId(this.currentFriends[index].user.id);
      }
    }
  }

  onShowBlocked(event) {
    this.showBlocked = event.srcElement.checked ? true : false;
    this.updateFriendsList(this.showBlocked);
  }

  onCancel() {
    this.selectionService.reset();
    this.pageStack.back();
  }

  onClickSelect() {
    this.pageStack.back();
  }

  onContextMenu(event, index: number) {
    let menuOptions;

    event.preventDefault();

    this.contextMenu = new WotlweduContextController();
    this.contextMenu.setService(this.dataSignalService);

    this.contextMenu.closeDown();
    this.contextMenu.getMousePosition(event);
    this.contextMenu.setObjectId(this.currentFriends[index].id);

    menuOptions = [];

    if (this.currentFriends[index].status.name === "Pending") {
      menuOptions = menuOptions.concat(this.removeRequestContextOptions);
    } else if (this.currentFriends[index].status.name === "Blocked") {
      menuOptions = menuOptions.concat(this.unblockContextOptions);
    } else {
      menuOptions = menuOptions.concat(this.unfriendContextOptions);
    }

    this.contextMenu.setOptions(menuOptions);
    this.contextMenu.show();
  }
}
