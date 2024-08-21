import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../../service/authdata.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { GlobalVariable } from '../../global';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-2fa',
  templateUrl: './verify2fa.component.html',
  styleUrl: './verify2fa.component.css',
})
export class Verify2FAComponent implements OnInit {
  userEmail: string = null;
  verificationToken: string = null;
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private authService: AuthDataService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  onSubmit(twoFactorForm: NgForm) {
    this.authService
      .verify2FA({
        userId: this.route.snapshot.params.userid,
        verificationToken: this.route.snapshot.params.verificationtoken,
        authToken: twoFactorForm.value.authToken,
      })
      .subscribe({
        error: (err) => {
          this.alertBox.handleError(err);
          return of(null);
        },
        next: (response) => {
          this.authService.setLoggedIn(true);
          return this.router.navigate([GlobalVariable.DEFAULT_START_PAGE]);
        },
      });
  }

  ngOnInit() {
    this.authService.reset();
  }

  onBack() {
    this.router.navigate(["/","auth"])
  }

}
