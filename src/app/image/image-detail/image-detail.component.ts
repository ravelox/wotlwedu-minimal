import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { WotlweduImage } from "../../datamodel/wotlwedu-image.model";
import { ImageDataService } from "../../service/imagedata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { WotlweduDialogController } from "../../controller/wotlwedu-dialog-controller.class";
import { ActivatedRoute, Router } from "@angular/router";
import { WotlweduPageStackService } from "../../service/pagestack.service";
import { WotlweduLoaderController } from "../../controller/wotlwedu-loader-controller.class";
import { WotlweduViewerController } from "../../controller/wotlwedu-viewer-controller.class";

@Component({
  selector: "app-image-detail",
  templateUrl: "./image-detail.component.html",
  styleUrl: "./image-detail.component.css",
})
export class ImageDetailComponent implements OnInit, OnDestroy {
  imageDetailForm: FormGroup;
  imageSub: Subscription;
  editMode: boolean = false;
  currentImage: WotlweduImage = null;
  alertBox: WotlweduAlert = new WotlweduAlert();
  currentUploadFile: File = null;
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  imageViewer: WotlweduViewerController = new WotlweduViewerController();

  constructor(
    private imageDataService: ImageDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.loader.start();
    this.pageStack.setRouter(this.router);
    this.imageSub = this.imageDataService.details.subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (image: WotlweduImage) => {
        if (image) {
          this.currentImage = image;
          this.currentUploadFile = null;
          this.editMode = true;
          this.initForm();
        } else {
          this.currentImage = null;
          this.currentUploadFile = null;
          this.editMode = false;
        }
        this.loader.stop();
        this.initForm();
      },
    });

    if (this.route.snapshot.params.imageId) {
      this.loader.start();
      this.imageDataService
        .getData(this.route.snapshot.params.imageId)
        .subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: (response) => {
            if (response && response.data && response.data.image) {
              this.imageDataService.setData(response.data.image);
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
    this.imageSub.unsubscribe();
  }

  onSubmit() {
    let imageId = null;
    if (this.imageDetailForm.value.imageId) {
      imageId = this.imageDetailForm.value.imageId;
    }
    const name = this.imageDetailForm.value.name;
    const description = this.imageDetailForm.value.description;

    this.loader.start();
    this.imageDataService.saveImage(imageId, name, description).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        if (this.currentUploadFile) {
          if (response.data.image.id) {
            this.loader.start();
            this.imageDataService
              .saveImageFile(response.data.image.id, this.currentUploadFile)
              .subscribe({
                error: (err) => {
                  this.loader.stop();
                  this.alertBox.handleError(err);
                },
                next: () => {
                  this.loader.stop();
                },
              });
          }
        }
        this.imageDataService.getAllData();
        this.onCancel();
      },
    });
  }

  initForm() {
    let imageId = null;
    let name = "";
    let description = "";
    let filename = null;

    if (this.currentImage) {
      imageId = this.currentImage.id;
      name = this.currentImage.name;
      description = this.currentImage.description;
    }

    this.imageDetailForm = new FormGroup({
      imageId: new FormControl(imageId),
      name: new FormControl(name, Validators.required),
      description: new FormControl(description, Validators.required),
      filename: new FormControl(filename),
    });

    if (this.currentImage) this.imageDetailForm.markAsDirty();
  }

  onCancel() {
    this.imageDetailForm.reset();
    this.editMode = false;
    this.currentUploadFile = null;
    this.currentImage = null;
    this.pageStack.back();
  }

  deleteImage(imageId: string) {
    this.loader.start();
    this.imageDataService.deleteImageFile(imageId).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: () => {
        this.imageDataService.deleteImage(imageId).subscribe({
          error: (err) => {
            this.loader.stop();
            this.alertBox.handleError(err);
          },
          next: () => {
            this.imageDataService.getAllData();
            this.loader.stop();
            this.onCancel();
          },
        });
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
    this.deleteImage(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onDelete() {
    this.showDeleteConfirmationDialog(this.imageDetailForm.value.imageId);
  }

  onUploadFileChange(event) {
    if (event.target.files[0]) {
      this.currentUploadFile = event.target.files[0];

      /* Preview the chosen file */
      const fileReader = new FileReader();
      this.loader.start();
      fileReader.addEventListener("loadend", (loadevent) => {
        if (!this.currentImage) {
          this.currentImage = new WotlweduImage();
        }
        this.currentImage.url = loadevent.target.result.toString();
        this.loader.stop();
      });
      fileReader.readAsDataURL(this.currentUploadFile);
    }

    this.imageDetailForm.markAsDirty();
    this.imageDetailForm.markAsTouched();
  }

  onImageClick() {
    this.imageViewer.setDataId(this.currentImage.id);
    this.imageViewer.setExtra(null);
    this.imageViewer.show();
  }
}
