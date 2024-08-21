import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-enable2fa',
  templateUrl: './enable2fa.component.html',
  styleUrl: './enable2fa.component.css',
})
export class Enable2FAComponent implements OnInit {
  allowVerification: boolean = false;
  enable2fa: boolean = false;
  qrCodeImage: string = null;
  secret: string = null;
  private _verified: boolean = false;
  verificationToken: string = null;
  alertBox: WotlweduAlert = new WotlweduAlert();
  @Output() close2FA = new EventEmitter<boolean>();

  constructor(private authDataService: AuthDataService) {}

  ngOnInit() {
    this._verified = false;
    this.authDataService.enable2FA().subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (
          response.data.secret &&
          response.data.QRCode &&
          response.data.verificationToken
        ) {
          this.allowVerification = true;
          this.qrCodeImage = response.data.QRCode;
          this.secret = response.data.secret;
          this.verificationToken = response.data.verificationToken;
        } else {
          this.alertBox.setErrorMessage(
            'Invalid verification data from server'
          );
        }
      },
    });
  }

  onCancel() {
    this.allowVerification = false;
    this.enable2fa = false;
    this.qrCodeImage = null;
    this._verified = false;
  }

  onSubmit(enable2faForm: NgForm) {
    /* Enabling 2FA */
    if (this.allowVerification) {
      this.authDataService
        .verify2FA({
          verificationToken: this.verificationToken,
          authToken: enable2faForm.value.authToken,
        })
        .subscribe({
          error: (err) => this.alertBox.handleError(err),
          next: (response) => {
            this._verified = true;
            this.onClose();
          },
        });
    }
  }

  onCheckbox(event) {
    if (!event.srcElement.checked) {
      this.onCancel();
    }
  }

  onClose() {
    this.close2FA.emit(this._verified);
  }
}
