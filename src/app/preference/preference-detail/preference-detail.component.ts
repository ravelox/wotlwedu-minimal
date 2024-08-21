import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, tap } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PreferenceDataService } from "../../service/preferencedata.service";
import { WotlweduPreference } from "../../datamodel/wotlwedu-preference.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";

@Component({
  selector: "app-preference-detail",
  templateUrl: "./preference-detail.component.html",
  styleUrl: "./preference-detail.component.css",
})
export class PreferenceDetailComponent implements OnInit, OnDestroy {
  preferenceDetailForm: FormGroup;
  prefSub: Subscription;
  editMode: boolean = false;
  currentPreference: WotlweduPreference;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private preferenceDataService: PreferenceDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.prefSub = this.preferenceDataService.details.subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (pref: WotlweduPreference) => {
        if (pref) {
          this.currentPreference = pref;
          this.editMode = true;
          this.initForm();
        }
      },
    });
    if (this.route.snapshot.params.preferenceId) {
      this.preferenceDataService
        .getData(this.route.snapshot.params.preferenceId)
        .subscribe({
          error: (err) => this.alertBox.handleError(err),
          next: (response) => {
            if (response && response.data && response.data.preference) {
              this.preferenceDataService.setData(response.data.preference);
            }
          },
        });
      this.pageStack.setRouter(this.router);
    }

    this.initForm();
  }

  ngOnDestroy() {
    this.prefSub.unsubscribe();
  }

  onSubmit() {
    let preferenceId = null;
    if (this.preferenceDetailForm.value.preferenceId) {
      preferenceId = this.preferenceDetailForm.value.preferenceId;
    }
    const name = this.preferenceDetailForm.value.name;
    const value = this.preferenceDetailForm.value.value;

    this.preferenceDataService
      .savePreference(preferenceId, name, value)
      .subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          this.preferenceDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let preferenceId = null;
    let name = "";
    let value = "";

    if (this.currentPreference) {
      preferenceId = this.currentPreference.id;
      name = this.currentPreference.name;
      value = this.currentPreference.value;
    }

    this.preferenceDetailForm = new FormGroup({
      preferenceId: new FormControl(preferenceId),
      name: new FormControl(name, Validators.required),
      value: new FormControl(value, Validators.required),
    });

    if (this.currentPreference) this.preferenceDetailForm.markAsDirty();
  }

  onCancel() {
    this.preferenceDetailForm.reset();
    this.editMode = false;
    this.pageStack.back();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deletePreference(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showConfirmationDialog(this.preferenceDetailForm.value.preferenceID);
  }

  deletePreference(object: any) {
    if (object) {
      this.preferenceDataService.deletePreference(object).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: (response) => {
          this.preferenceDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }
}
