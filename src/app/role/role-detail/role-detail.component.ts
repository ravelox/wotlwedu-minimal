import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, of } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { RoleDataService } from "../../service/roledata.service";
import { WotlweduRole } from "../../datamodel/wotlwedu-role.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduSelectionService } from "../../service/selectiondata.service";
import { DataSignalService } from "../../service/datasignal.service";

@Component({
  selector: "app-role-detail",
  templateUrl: "./role-detail.component.html",
  styleUrl: "./role-detail.component.css",
})
export class RoleDetailComponent implements OnInit, OnDestroy {
  capListName: string = "roledetail";
  userListName: string = "userdetail";
  roleSub: Subscription;
  currentRole: WotlweduRole = null;
  roleDetailForm: FormGroup;
  filterForm: FormGroup;
  editMode: boolean = false;
  dragAndDropSub: Subscription;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  capIsVisible: boolean = false;
  userIsVisible: boolean = true;

  constructor(
    private roleDataService: RoleDataService,
    private pageStack: WotlweduPageStackService,
    private router: Router,
    private route: ActivatedRoute,
    private selectionService: WotlweduSelectionService,
    private dataSignalService: DataSignalService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.roleSub = this.roleDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (role: WotlweduRole) => {
        if (role) {
          this.currentRole = role;
          this.editMode = true;
          this.initForm();
          this.selectionService.reset();

          // Add the users and capabilities from the role
          // to the selection service
          if (this.currentRole.capabilities) {
            this.currentRole.capabilities.forEach((c) => {
              this.selectionService.push("cap", c.id);
            });
          }
          if (this.currentRole.users) {
            this.currentRole.users.forEach((u) => {
              this.selectionService.push("user", u.id);
            });
          }
        }
      },
    });

    if (this.route.snapshot.params.roleId) {
      this.loader.start();
      this.roleDataService
        .getData(this.route.snapshot.params.roleId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.role) {
              this.roleDataService.setData(response.data.role);
              this.loader.stop();
            }
          },
        });
    }
    this.initForm();
    this.loader.stop();
  }

  ngOnDestroy() {
    if (this.roleSub) this.roleSub.unsubscribe();
    if (this.dragAndDropSub) this.dragAndDropSub.unsubscribe();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteRole(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    let roleId = null;
    if (this.roleDetailForm.value.roleId) {
      roleId = this.roleDetailForm.value.roleId;
    }
    const name = this.roleDetailForm.value.name;
    const description = this.roleDetailForm.value.description;
    const capabilities = this.currentRole ? this.currentRole.capabilities : [];
    const users = this.currentRole ? this.currentRole.users : [];

    const usersToDelete = [];
    const usersToAdd = [];
    const capsToDelete = [];
    const capsToAdd = [];

    // If the user in the role list is not in the selection
    // list, it must be deleted
    users.forEach((u) => {
      if (!this.selectionService.find(u.id)) {
        usersToDelete.push(u.id);
      }
    });

    // If there is a user in the selection list that is not
    // in the role list, it must be added
    const selectedUsers = this.selectionService.get("user");
    if (selectedUsers) {
      selectedUsers.forEach((u) => {
        const foundUser = users.find((x) => u.id === x.id);
        if (!foundUser) {
          usersToAdd.push(u.id);
        }
      });
    }

    // If the cap in the role list is not in the selection
    // list, it must be deleted
    capabilities.forEach((c) => {
      if (!this.selectionService.find(c.id)) {
        capsToDelete.push(c.id);
      }
    });

    // If there is a cap in the selection list that is not
    // in the role list, it must be added
    const selectedCaps = this.selectionService.get("cap");
    if (selectedCaps) {
      selectedCaps.forEach((c) => {
        const foundCap = users.find((x) => c.id === x.id);
        if (!foundCap) {
          capsToAdd.push(c.id);
        }
      });
    }

    /* Update the role itself */
    this.roleDataService.saveRole(roleId, name, description).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (updateResponse) => {
        if (updateResponse && updateResponse.data.role.id) {
          const newRoleId = updateResponse.data.role.id;
          this.roleDataService
            .deleteCapabilities(newRoleId, capsToDelete)
            .subscribe({
              error: (err) => this.alertBox.handleError(err),
              next: () => {
                this.roleDataService
                  .addCapabilities(newRoleId, capsToAdd)
                  .subscribe({
                    error: (err) => this.alertBox.handleError(err),
                    next: () => {
                      this.roleDataService
                        .deleteUsers(newRoleId, usersToDelete)
                        .subscribe({
                          error: (err) => this.alertBox.handleError(err),
                          next: () => {
                            this.roleDataService
                              .addUsers(newRoleId, usersToAdd)
                              .subscribe({
                                error: (err) => this.alertBox.handleError(err),
                                next: () => {
                                  this.roleDataService.getAllData();
                                  this.onCancel();
                                },
                              });
                          },
                        });
                    },
                  });
              },
            });
        }
      },
    });
  }

  initForm() {
    let roleId = "";
    let name = "";
    let description = "";

    if (this.currentRole) {
      roleId = this.currentRole.id;
      name = this.currentRole.name;
      description = this.currentRole.description;
    }
    this.roleDetailForm = new FormGroup({
      roleId: new FormControl(roleId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentRole) this.roleDetailForm.markAsDirty();
  }

  onCancel() {
    this.roleDetailForm.reset();
    this.currentRole = null;
    this.editMode = false;
    this.pageStack.back();
  }

  deleteRole(roleId: string) {
    if (roleId) {
      this.roleDataService.deleteRole(roleId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.roleDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

  onDelete() {
    this.showConfirmationDialog(this.roleDetailForm.value.roleId);
  }

  onCapToggle() {
    this.capIsVisible = !this.capIsVisible;
    if (this.userIsVisible) this.userIsVisible = !this.userIsVisible;
  }

  onUserToggle() {
    this.userIsVisible = !this.userIsVisible;
    if (this.capIsVisible) this.capIsVisible = !this.capIsVisible;
  }
}
