import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduCategory } from "../../datamodel/wotlwedu-category.model";
import { CategoryDataService } from "../../service/categorydata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-category-detail",
  templateUrl: "./category-detail.component.html",
  styleUrl: "./category-detail.component.css",
})
export class CategoryDetailComponent implements OnInit, OnDestroy {
  categoryDetailForm: FormGroup;
  categorySub: Subscription;
  editMode: boolean = false;
  currentCategory: WotlweduCategory;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private categoryDataService: CategoryDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);

    this.categorySub = this.categoryDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (category: WotlweduCategory) => {
        if (category) {
          this.currentCategory = category;
          this.editMode = true;
          this.initForm();
        }
        this.loader.stop();
      },
    });

    if (this.route.snapshot.params.categoryId) {
      this.loader.start();
      this.categoryDataService
        .getData(this.route.snapshot.params.categoryId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.category) {
              this.categoryDataService.setData(response.data.category);
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
    this.categorySub.unsubscribe();
  }

  onSubmit() {
    let categoryId = null;
    if (this.categoryDetailForm.value.categoryId) {
      categoryId = this.categoryDetailForm.value.categoryId;
    }
    const name = this.categoryDetailForm.value.name;
    const description = this.categoryDetailForm.value.description;

    this.loader.start();
    this.categoryDataService
      .saveCategory(categoryId, name, description)
      .subscribe({
        error: (err) => {
          this.loader.stop();
          this.alertBox.handleError(err);
        },
        next: () => {
          this.categoryDataService.getAllData();
          this.onCancel();
        },
      });
  }

  initForm() {
    let categoryId = null;
    let name = "";
    let description = "";

    if (this.currentCategory) {
      categoryId = this.currentCategory.id;
      name = this.currentCategory.name;
      description = this.currentCategory.description;
    }

    this.categoryDetailForm = new FormGroup({
      categoryId: new FormControl(categoryId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
    });

    if (this.currentCategory) this.categoryDetailForm.markAsDirty();
  }

  showDeleteConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    if (object && object.id) {
      const categoryId = object.id;

      if (categoryId) {
        this.loader.start();
        this.categoryDataService.deleteCategory(categoryId).subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            this.categoryDataService.getAllData();
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
    this.categoryDetailForm.reset();
    this.editMode = false;
    this.pageStack.back();
  }

  onDelete() {
    this.showDeleteConfirmationDialog({
      id: this.categoryDetailForm.value.categoryId,
    });
  }
}
