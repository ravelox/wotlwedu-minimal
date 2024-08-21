import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduGroup } from "../../datamodel/wotlwedu-group.model";
import { GroupDataService } from "../../service/groupdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

class WotlweduSelectionData {
  type: string;
  id: string;
}

@Component({
  selector: "app-group-detail",
  templateUrl: "./group-detail.component.html",
  styleUrl: "./group-detail.component.css",
})
export class GroupDetailComponent implements OnInit, OnDestroy {
  groupSub: Subscription;
  currentGroup: WotlweduGroup = null;
  groupDetailForm: FormGroup;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  sharedSelectData: WotlweduSelectionData[] = [];
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private groupDataService: GroupDataService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
    private route: ActivatedRoute,
    private selectionService: WotlweduSelectionService,
    private dataSignalService: DataSignalService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.initForm();
    this.loader.start();
    this.groupSub = this.groupDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (group: WotlweduGroup) => {
        if (group) {
          this.currentGroup = group;
          this.selectionService.reset();
          this.currentGroup.users.forEach((u) => {
            this.selectionService.push("user", u.id);
          });
          this.editMode = true;
          this.initForm();
          this.dataSignalService.refreshData();
        }
        this.loader.stop();
      },
    });
    if (this.route.snapshot.params.groupId) {
      this.loader.start();
      this.groupDataService
        .getData(this.route.snapshot.params.groupId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.group) {
              this.groupDataService.setData(response.data.group);
            }

            this.loader.stop();
          },
        });
    }
    this.loader.stop();
  }

  ngOnDestroy() {
    if (this.groupSub) this.groupSub.unsubscribe();
  }

  onSubmit() {
    let groupId = null;
    if (this.groupDetailForm.value.groupId) {
      groupId = this.groupDetailForm.value.groupId;
    }
    const name = this.groupDetailForm.value.name;
    const description = this.groupDetailForm.value.description;
    const users = this.currentGroup.users;

    /* Work out which users are added or deleted */
    let usersToAdd = [];
    let usersToDelete = [];

    // If the user in the group list is not in the selection
    // list, it must be deleted
    users.forEach((x) => {
      if (!this.selectionService.find(x.id)) {
        usersToDelete.push(x.id);
      }
    });

    // If there is a user in the selection list that is not
    // in the group list, it must be added
    const selectedUsers = this.selectionService.get("user");
    if (selectedUsers) {
      selectedUsers.forEach((x) => {
        const foundUser = users.find((u) => u.id === x.id);
        if (!foundUser) {
          usersToAdd.push(x.id);
        }
      });
    }

    this.loader.start();
    /* Update the group itself */
    this.groupDataService.saveGroup(groupId, name, description).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (updateResponse) => {
        /* Add and delete the capabilities */
        if (updateResponse && updateResponse.data.group) {
          const newGroupId = updateResponse.data.group.id;
          this.groupDataService
            .deleteUsers(newGroupId, usersToDelete)
            .subscribe({
              error: (err) => {
                this.loader.stop();
                this.alertBox.handleError(err);
              },
              next: (delResponse) => {
                this.groupDataService
                  .addUsers(newGroupId, usersToAdd)
                  .subscribe({
                    error: (err) => {
                      this.loader.stop();
                      this.alertBox.handleError(err);
                    },
                    next: (addResponse) => {
                      this.groupDataService.getAllData();
                      this.loader.stop();
                      this.onCancel();
                    },
                  });
              },
            });
        }
      },
    });
  }

  initForm() {
    let groupId = "";
    let name = "";
    let description = "";

    if (this.currentGroup) {
      groupId = this.currentGroup.id;
      name = this.currentGroup.name;
      description = this.currentGroup.description;
    } else {
      this.currentGroup = new WotlweduGroup();
      this.currentGroup.users = [];
    }
    this.groupDetailForm = new FormGroup({
      groupId: new FormControl(groupId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentGroup) this.groupDetailForm.markAsDirty();
  }

  onCancel() {
    this.loader.stop();
    this.groupDetailForm.reset();
    this.selectionService.reset();
    this.currentGroup = null;
    this.editMode = false;
    this.pageStack.back();
  }

  deleteGroup(groupId: string) {
    this.loader.start();
    this.groupDataService.deleteGroup(groupId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.groupDataService.getAllData();
        this.onCancel();
      },
    });
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteGroup(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog(this.groupDetailForm.value.groupId);
  }
}
