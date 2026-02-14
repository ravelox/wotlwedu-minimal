import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduOrganization } from "../../datamodel/wotlwedu-organization.model";
import { OrganizationDataService } from "../../service/organizationdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { TokenDataStorageService } from "../../service/tokendata.service";

@Component({
  selector: "app-organization-detail",
  templateUrl: "./organization-detail.component.html",
  styleUrl: "./organization-detail.component.css",
})
export class OrganizationDetailComponent implements OnInit, OnDestroy {
  organizationDetailForm: FormGroup;
  organizationSub: Subscription;
  editMode: boolean = false;
  currentOrganization: WotlweduOrganization;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  isSystemAdmin: boolean = false;

  constructor(
    private tokenDataService: TokenDataStorageService,
    private organizationDataService: OrganizationDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.isSystemAdmin = this.tokenDataService.getSystemAdmin() === true;
    this.loader.start();
    this.pageStack.setRouter(this.router);

    this.organizationSub = this.organizationDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (org: WotlweduOrganization) => {
        if (org) {
          this.currentOrganization = org;
          this.editMode = true;
          this.initForm();
        }
        this.loader.stop();
      },
    });

    if (this.route.snapshot.params.organizationId) {
      this.loader.start();
      this.organizationDataService
        .getData(this.route.snapshot.params.organizationId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.organization) {
              this.organizationDataService.setData(response.data.organization);
            }
            this.loader.stop();
          },
        });
    } else {
      this.loader.stop();
    }
    this.initForm();
  }

  ngOnDestroy() {
    if (this.organizationSub) this.organizationSub.unsubscribe();
  }

  onSubmit() {
    let organizationId = null;
    if (this.organizationDetailForm.value.organizationId) {
      organizationId = this.organizationDetailForm.value.organizationId;
    }
    const name = this.organizationDetailForm.value.name;
    const description = this.organizationDetailForm.value.description;
    const active = this.organizationDetailForm.value.active === true;

    this.loader.start();
    this.organizationDataService
      .saveOrganization(organizationId, name, description, active)
      .subscribe({
        error: (err) => {
          this.loader.stop();
          this.alertBox.handleError(err);
        },
        next: () => {
          this.organizationDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let organizationId = null;
    let name = "";
    let description = "";
    let active = true;

    if (this.currentOrganization) {
      organizationId = this.currentOrganization.id;
      name = this.currentOrganization.name;
      description = this.currentOrganization.description;
      if (this.currentOrganization.active || this.currentOrganization.active === false) {
        active = this.currentOrganization.active;
      }
    }

    this.organizationDetailForm = new FormGroup({
      organizationId: new FormControl(organizationId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description),
      active: new FormControl(active),
    });

    // Only system admins can create new orgs; org admins can edit their own org.
    if (!this.isSystemAdmin && !this.editMode) {
      this.organizationDetailForm.disable();
    }

    if (this.currentOrganization) this.organizationDetailForm.markAsDirty();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    if (this.isSystemAdmin !== true) return this.confirmDialog.hide();
    if (object && object.id) {
      const organizationId = object.id;

      if (organizationId) {
        this.loader.start();
        this.organizationDataService.deleteOrganization(organizationId).subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: () => {
            this.organizationDataService.getAllData();
            this.onCancel();
          },
        });
      }
    }

    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onCancel() {
    this.loader.stop();
    this.organizationDetailForm.reset();
    this.editMode = false;
    this.pageStack.back();
  }

  onDelete() {
    if (this.isSystemAdmin !== true) return;
    this.showDeleteConfirmationDialog({
      id: this.organizationDetailForm.value.organizationId,
    });
  }
}

