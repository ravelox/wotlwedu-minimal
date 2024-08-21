import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { WotlweduItem } from "../../datamodel/wotlwedu-item.model";
import { ItemDataService } from "../../service/itemdata.service";
import { WotlweduImage } from "../../datamodel/wotlwedu-image.model";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ImageDataService } from "../../service/imagedata.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";

@Component({
  selector: "app-item-detail",
  templateUrl: "./item-detail.component.html",
  styleUrl: "./item-detail.component.css",
})
export class ItemDetailComponent implements OnInit, OnDestroy {
  selectMode: boolean = false;
  itemDetailForm: FormGroup;
  itemSub: Subscription;
  editMode: boolean = false;
  currentItem: WotlweduItem = null;
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();

  constructor(
    private itemDataService: ItemDataService,
    private imageDataService: ImageDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.itemSub = this.itemDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (item: WotlweduItem) => {
        if (item) {
          this.currentItem = item;
          this.editMode = true;
          this.initForm();
        }
        this.loader.stop();
      },
    });
    if (this.route.snapshot.params.itemId) {
      this.loader.start();
      this.itemDataService
        .getData(this.route.snapshot.params.itemId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.item) {
              this.itemDataService.setData(response.data.item);
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
    this.itemSub.unsubscribe();
  }

  onSubmit() {
    const itemObject = new WotlweduItem();

    if (this.itemDetailForm.value.itemId) {
      itemObject.id = this.itemDetailForm.value.itemId;
    }
    itemObject.name = this.itemDetailForm.value.name;
    itemObject.description = this.itemDetailForm.value.description;
    itemObject.url = this.itemDetailForm.value.url;
    itemObject.location = this.itemDetailForm.value.location;
    itemObject.image = new WotlweduImage();
    itemObject.image.id = this.currentImage ? this.currentImage.id : null;

    this.loader.start();
    this.itemDataService.saveItem(itemObject).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.itemDataService.getAllData();
        this.loader.stop();
        this.onCancel();
      },
    });
  }

  initForm() {
    let itemId = null;
    let name = "";
    let description = "";
    let url = "";
    let location = "";

    if (this.currentItem) {
      itemId = this.currentItem.id;
      name = this.currentItem.name;
      description = this.currentItem.description;
      url = this.currentItem.url;
      location = this.currentItem.location;

      this.currentImage = this.currentItem.image
        ? this.currentItem.image
        : null;
    }

    this.itemDetailForm = new FormGroup({
      itemId: new FormControl(itemId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      url: new FormControl(url),
      location: new FormControl(location),
    });

    this.itemDetailForm.addValidators(
      this.EitherOrValidator(
        this.itemDetailForm.get("url"),
        this.itemDetailForm.get("location")
      )
    );

    if (this.currentItem) this.itemDetailForm.markAsDirty();
  }

  EitherOrValidator(controlOne: AbstractControl, controlTwo: AbstractControl) {
    return () => {
      if (!controlOne.value && !controlTwo.value) return { nomatch: true };
      return null;
    };
  }

  onCancel() {
    this.itemDetailForm.reset();
    this.editMode = false;
    this.currentImage = null;
    this.currentItem = null;
    this.pageStack.back();
  }

  deleteItem(itemId: string) {
    if (itemId) {
      this.loader.start();
      this.itemDataService.deleteItem(itemId).subscribe({
        error: (err) => {
          this.loader.stop();
          this.alertBox.handleError(err);
        },
        next: (response) => {
          this.itemDataService.getAllData();
          this.loader.stop();
          this.onCancel();
        },
      });
    }
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage("Are you sure?");
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteItem(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showConfirmationDialog(this.itemDetailForm.value.itemId);
  }

  toggleImageSelector() {
    this.imageSelectorVisible = !this.imageSelectorVisible;
  }

  onImageSelect(event: string) {
    this.imageSelectorVisible = false;
    this.loader.start();
    this.imageDataService.getData(event).subscribe({
      error: (err)=>{
        this.loader.stop();
        this.alertBox.handleError(err)
      },
      next: (response) => {
        this.loader.stop();
        if (response && response.data && response.data.image) {
          this.currentImage = response.data.image;
        }
      },
    });
  }
}
