import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { WotlweduList } from "../../datamodel/wotlwedu-list.model";
import { ListDataService } from "../../service/listdata.service";
import { ItemDataService } from "../../service/itemdata.service";

class WotlweduSelectionData {
  type: string;
  id: string;
}

@Component({
  selector: "app-list-detail",
  templateUrl: "./list-detail.component.html",
  styleUrl: "./list-detail.component.css",
})
export class ListDetailComponent implements OnInit, OnDestroy {
  listSub: Subscription;
  currentList: WotlweduList = null;
  listDetailForm: FormGroup;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  sharedSelectData: WotlweduSelectionData[] = [];
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private listDataService: ListDataService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
    private route: ActivatedRoute,
    private selectionService: WotlweduSelectionService,
    private dataSignalService: DataSignalService,
    private itemDataService: ItemDataService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.initForm();
    this.loader.start();
    this.listSub = this.listDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (group: WotlweduList) => {
        if (group) {
          this.currentList = group;
          this.selectionService.reset();
          for (let i of this.currentList.items) {
            this.selectionService.push("item", i.id);
          }
          this.dataSignalService.refreshData();
          this.editMode = true;
          this.initForm();
        }
        this.loader.stop();
      },
    });
    if (this.route.snapshot.params.listId) {
      this.loader.start();
      this.listDataService
        .getData(this.route.snapshot.params.listId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.list) {
              this.listDataService.setData(response.data.list);
            }

            this.loader.stop();
          },
        });
    }
    this.loader.stop();
  }

  ngOnDestroy() {
    if (this.listSub) this.listSub.unsubscribe();
  }

  onSubmit() {
    let listId = null;
    if (this.listDetailForm.value.listId) {
      listId = this.listDetailForm.value.listId;
    }
    const name = this.listDetailForm.value.name;
    const description = this.listDetailForm.value.description;
    const items = this.currentList.items;

    /* Work out which items are added or deleted */
    let itemsToAdd = [];
    let itemsToDelete = [];

    // If the user in the group list is not in the selection
    // list, it must be deleted
    items.forEach((x) => {
      if (!this.selectionService.find(x.id)) {
        itemsToDelete.push(x.id);
      }
    });

    // If there is a user in the selection list that is not
    // in the group list, it must be added
    const selectedUsers = this.selectionService.get("item");
    if (selectedUsers) {
      selectedUsers.forEach((x) => {
        const foundUser = items.find((u) => u.id === x.id);
        if (!foundUser) {
          itemsToAdd.push(x.id);
        }
      });
    }

    this.loader.start();
    /* Update the group itself */
    this.listDataService.saveList(listId, name, description).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (updateResponse) => {
        /* Add and delete the capabilities */
        if (updateResponse && updateResponse.data.list) {
          const newlistId = updateResponse.data.list.id;
          this.listDataService
            .deleteItems(newlistId, itemsToDelete)
            .subscribe({
              error: (err) => {
                this.loader.stop();
                this.alertBox.handleError(err);
              },
              next: (delResponse) => {
                this.listDataService
                  .addItems(newlistId, itemsToAdd)
                  .subscribe({
                    error: (err) => {
                      this.loader.stop();
                      this.alertBox.handleError(err);
                    },
                    next: (addResponse) => {
                      this.listDataService.getAllData();
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
    let listId = "";
    let name = "";
    let description = "";

    if (this.currentList) {
      listId = this.currentList.id;
      name = this.currentList.name;
      description = this.currentList.description;
    } else {
      this.currentList = new WotlweduList();
      this.currentList.items = [];
    }
    this.listDetailForm = new FormGroup({
      listId: new FormControl(listId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentList) this.listDetailForm.markAsDirty();
  }

  onCancel() {
    this.loader.stop();
    this.listDetailForm.reset();
    this.selectionService.reset();
    this.currentList = null;
    this.editMode = false;
    this.pageStack.back();
  }

  deleteList(listId: string) {
    this.loader.start();
    this.listDataService.deleteList(listId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.listDataService.getAllData();
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
    this.deleteList(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog(this.listDetailForm.value.listId);
  }
}
