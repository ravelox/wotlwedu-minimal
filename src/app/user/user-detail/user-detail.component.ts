import { Component, OnDestroy, OnInit } from '@angular/core';
import { UserDataService } from '../../service/userdata.service';
import { Subscription } from 'rxjs';
import { WotlweduUser } from '../../datamodel/wotlwedu-user.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { WotlweduImage } from '../../datamodel/wotlwedu-image.model';
import { ImageDataService } from '../../service/imagedata.service';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { WotlweduDialogController } from '../../controller/wotlwedu-dialog-controller.class';
import { ActivatedRoute, Router } from '@angular/router';
import { WotlweduPageStackService } from '../../service/pagestack.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  currentUser: WotlweduUser = null;
  userDetailForm: FormGroup;
  editMode: boolean = false;
  currentImage: WotlweduImage = null;
  imageSelectorVisible: boolean = false;
  friendListVisible: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();
  confirmDialog: WotlweduDialogController = new WotlweduDialogController();

  constructor(
    private authDataService: AuthDataService,
    private userDataService: UserDataService,
    private imageDataService: ImageDataService,
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService
  ) {}

  ngOnInit() {
    this.userSub = this.userDataService.details.subscribe({
      error: (err) => {
        this.alertBox.handleError(err);
      },
      next: (user: WotlweduUser) => {
        if (user) {
          if (user.id === this.authDataService.id) {
            this.alertBox.setErrorMessage('Cannot edit your own details');
          } else {
            this.currentUser = user;
            this.editMode = true;
            this.initForm();
          }
        }
      },
    });
    if( this.route.snapshot.params.userId )
      {
        this.userDataService.getData( this.route.snapshot.params.userId).subscribe({
          error: (err)=>this.alertBox.handleError(err),
          next: (response)=>{
            if( response && response.data && response.data.user ) {
              this.userDataService.setData( response.data.user );
            }
          }
        });
        this.pageStack.setRouter( this.router )
      }
    this.initForm();
  }

  ngOnDestroy() {
    if (this.userSub) this.userSub.unsubscribe();
  }

  showConfirmationDialog(object: any) {
    this.confirmDialog.setYesAction(this.dialogDeleteYesClick.bind(this));
    this.confirmDialog.setNoAction(this.dialogDeleteNoClick.bind(this));
    this.confirmDialog.setMessage('Are you sure?');
    this.confirmDialog.setObjectData(object);
    this.confirmDialog.show();
  }

  dialogDeleteYesClick(object: any) {
    this.deleteUser(object);
    this.confirmDialog.hide();
  }

  dialogDeleteNoClick(object: any) {
    this.confirmDialog.hide();
  }

  onSubmit() {
    const userObject = new WotlweduUser();

    if (this.userDetailForm.value.userId) {
      userObject.id = this.userDetailForm.value.userId;
    }
    userObject.email = this.userDetailForm.value.email;
    userObject.firstName = this.userDetailForm.value.firstName;
    userObject.lastName = this.userDetailForm.value.lastName;
    userObject.alias = this.userDetailForm.value.alias;
    userObject.active = this.userDetailForm.value.active;
    userObject.verified = this.userDetailForm.value.verified;
    userObject.image = new WotlweduImage();
    userObject.image.id = this.currentImage ? this.currentImage.id : null;
    userObject.admin = this.userDetailForm.value.admin;

    if (this.userDetailForm.value.resetpassword) {
      this.authDataService.requestPasswordReset(userObject.email).subscribe({
        error: (err) => {
          this.alertBox.handleError(err);
        },
        next: () => {},
      });
    }

    this.userDataService.saveUser(userObject).subscribe({
      error: (err) => {
        this.alertBox.handleError(err);
      },
      next: () => {
        this.userDataService.getAllData();
        this.onCancel();
      },
    });
  }

  initForm() {
    let userId: string = '';
    let email: string = '';
    let firstName: string = '';
    let lastName: string = '';
    let alias: string = '';
    let active: boolean = false;
    let verified: boolean = false;
    let admin: boolean = false;

    if (this.currentUser) {
      userId = this.currentUser.id;
      email = this.currentUser.email;
      firstName = this.currentUser.firstName;
      lastName = this.currentUser.lastName;
      alias = this.currentUser.alias;
      if (this.currentUser.active) active = this.currentUser.active;
      if (this.currentUser.verified) verified = this.currentUser.verified;
      this.currentImage = this.currentUser.image
        ? this.currentUser.image
        : null;
        if( this.currentUser.admin ) admin = this.currentUser.admin;
    }
    this.userDetailForm = new FormGroup({
      userId: new FormControl(userId),
      email: new FormControl(email, Validators.required),
      firstName: new FormControl(firstName, Validators.required),
      lastName: new FormControl(lastName, Validators.required),
      alias: new FormControl(alias),
      active: new FormControl(active),
      verified: new FormControl(verified),
      admin: new FormControl(admin),
      resetpassword: new FormControl(false),
    });

    if (this.currentUser) this.userDetailForm.markAsDirty();
  }

  onCancel() {
    this.userDetailForm.reset();
    this.currentUser = null;
    this.editMode = false;
    this.currentImage = null;
    this.userDataService.onCancel();
    this.pageStack.back()
  }

  deleteUser(userId: string) {
    if (userId) {
      this.userDataService.deleteUser(userId).subscribe({
        error: (err) => this.alertBox.handleError(err),
        next: () => {
          this.userDataService.getAllData();
          this.onCancel();
        },
      });
    }
  }

  onDelete() {
    this.showConfirmationDialog(this.userDetailForm.value.userId);
  }

  toggleImageSelector() {
    this.imageSelectorVisible = !this.imageSelectorVisible;
  }

  toggleFriendList() {
    this.friendListVisible = !this.friendListVisible;
  }
}
