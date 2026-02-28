import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduWorkgroup } from "../../datamodel/wotlwedu-workgroup.model";
import { WotlweduCategory } from "../../datamodel/wotlwedu-category.model";
import { WorkgroupDataService } from "../../service/workgroupdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { DataSignalService } from "../../service/datasignal.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { TokenDataStorageService } from "../../service/tokendata.service";
import { CategoryDataService } from "../../service/categorydata.service";

class WotlweduSelectionData {
  type: string;
  id: string;
}

@Component({
  selector: "app-workgroup-detail",
  templateUrl: "./workgroup-detail.component.html",
  styleUrl: "./workgroup-detail.component.css",
})
export class WorkgroupDetailComponent implements OnInit, OnDestroy {
  workgroupSub: Subscription;
  categorySub: Subscription;
  currentWorkgroup: WotlweduWorkgroup = null;
  currentCategories: WotlweduCategory[] = [];
  workgroupDetailForm: FormGroup;
  editMode: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  sharedSelectData: WotlweduSelectionData[] = [];
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private tokenDataService: TokenDataStorageService,
    private workgroupDataService: WorkgroupDataService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
    private route: ActivatedRoute,
    private selectionService: WotlweduSelectionService,
    private dataSignalService: DataSignalService,
    private categoryDataService: CategoryDataService
  ) {}

  ngOnInit() {
    this.pageStack.setRouter(this.router);
    this.initForm();
    this.loader.start();
    this.workgroupSub = this.workgroupDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (workgroup: WotlweduWorkgroup) => {
        if (workgroup) {
          this.currentWorkgroup = workgroup;
          this.selectionService.reset();
          (this.currentWorkgroup.users || []).forEach((u) => {
            this.selectionService.push("user", u.id);
          });
          this.editMode = true;
          this.initForm();
          this.dataSignalService.refreshData();
        }
        this.loader.stop();
      },
    });
    this.categorySub = this.categoryDataService.dataChanged.subscribe({
      next: (categories: WotlweduCategory[]) => {
        this.currentCategories = categories || [];
      },
    });
    this.categoryDataService.getAllData();
    if (this.route.snapshot.params.workgroupId) {
      this.loader.start();
      this.workgroupDataService
        .getData(this.route.snapshot.params.workgroupId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.workgroup) {
              this.workgroupDataService.setData(response.data.workgroup);
            }

            this.loader.stop();
          },
        });
    }
    this.loader.stop();
  }

  ngOnDestroy() {
    if (this.workgroupSub) this.workgroupSub.unsubscribe();
    if (this.categorySub) this.categorySub.unsubscribe();
  }

  onSubmit() {
    let workgroupId = null;
    if (this.workgroupDetailForm.value.workgroupId) {
      workgroupId = this.workgroupDetailForm.value.workgroupId;
    }
    const name = this.workgroupDetailForm.value.name;
    const description = this.workgroupDetailForm.value.description;
    const organizationId = this.workgroupDetailForm.value.organizationId || null;
    const categoryId = this.workgroupDetailForm.value.categoryId || null;
    const users = this.currentWorkgroup.users || [];

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
    /* Update the workgroup itself */
    this.workgroupDataService
      .saveWorkgroup(workgroupId, name, description, organizationId, categoryId)
      .subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (updateResponse) => {
        /* Add and delete the capabilities */
        if (updateResponse && updateResponse.data.workgroup) {
          const newWorkgroupId = updateResponse.data.workgroup.id;
          this.workgroupDataService
            .deleteUsers(newWorkgroupId, usersToDelete)
            .subscribe({
              error: (err) => {
                this.loader.stop();
                this.alertBox.handleError(err);
              },
              next: (delResponse) => {
                this.workgroupDataService
                  .addUsers(newWorkgroupId, usersToAdd)
                  .subscribe({
                    error: (err) => {
                      this.loader.stop();
                      this.alertBox.handleError(err);
                    },
                    next: (addResponse) => {
                      this.workgroupDataService.getAllData();
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
    let workgroupId = "";
    let name = "";
    let description = "";
    let organizationId = "";
    let categoryId = "";

    if (this.currentWorkgroup) {
      workgroupId = this.currentWorkgroup.id;
      name = this.currentWorkgroup.name;
      description = this.currentWorkgroup.description;
      organizationId = this.currentWorkgroup.organizationId || "";
      categoryId = this.currentWorkgroup.category?.id || "";
    } else {
      this.currentWorkgroup = new WotlweduWorkgroup();
      this.currentWorkgroup.users = [];
    }
    const isSystemAdmin = this.tokenDataService.getSystemAdmin() === true;
    this.workgroupDetailForm = new FormGroup({
      workgroupId: new FormControl(workgroupId),
      organizationId: new FormControl(organizationId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      categoryId: new FormControl(categoryId),
    });

    if (!isSystemAdmin) {
      this.workgroupDetailForm.get("organizationId")?.disable();
    }

    if (this.currentWorkgroup) this.workgroupDetailForm.markAsDirty();
  }

  onCancel() {
    this.loader.stop();
    this.workgroupDetailForm.reset();
    this.selectionService.reset();
    this.currentWorkgroup = null;
    this.editMode = false;
    this.pageStack.back();
  }

  deleteWorkgroup(workgroupId: string) {
    this.loader.start();
    this.workgroupDataService.deleteWorkgroup(workgroupId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.workgroupDataService.getAllData();
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
    this.deleteWorkgroup(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog(this.workgroupDetailForm.value.workgroupId);
  }
}
