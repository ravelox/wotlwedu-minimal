import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-2fa-mini',
  templateUrl: './verify2fa-mini.component.html',
  styleUrl: './verify2fa-mini.component.css',
})
export class Verify2FAMiniComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  verificationToken: string = null;
  alertBox: WotlweduAlert = new WotlweduAlert();
  @Output() closeverify: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('inputAuthToken') inputField: ElementRef;
  private _authSub: Subscription;
  private _authUserId: string;
  private _verified: boolean = false;
  verificationError: boolean = false;
  verificationMessage: string = null;

  constructor(private authService: AuthDataService) {}

  onSubmit(twoFactorForm: NgForm) {
    this.verificationError = false;
    this.authService.gen2FAVerificationToken().subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        if (response && response.data && response.data.token) {
          this.authService
            .verify2FA({
              userId: this._authUserId,
              verificationToken: response.data.token,
              authToken: twoFactorForm.value.authToken,
            })
            .subscribe({
              error: (err) => {
                this.verificationError = true;
                this.verificationMessage = 'Invalid verification code';
              },
              next: (response) => {
                if (response && response.data && response.data.userId)
                  if (this._authUserId === response.data.userId) {
                    this._verified = true;
                    this.onClose();
                  } else {
                    this.verificationError = true;
                    this.verificationMessage = 'Invalid return details';
                  }
              },
            });
        }
      },
    });
  }

  ngOnInit() {
    this._verified = false;
    this._authSub = this.authService.authData.subscribe({
      next: (authDetails) => {
        if (!authDetails) {
          this.alertBox.setErrorMessage('Not logged in');
        } else {
          if (authDetails) {
            this._authUserId = authDetails.id;
          }
        }
      },
    });
  }

  ngAfterViewInit(): void {
    if (this.inputField) this.inputField.nativeElement.focus();
  }

  ngOnDestroy(): void {
    if (this._authSub) this._authSub.unsubscribe();
  }

  onClose() {
    this.closeverify.emit(this._verified);
  }
}
