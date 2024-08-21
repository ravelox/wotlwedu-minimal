import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { WotlweduRegistration } from '../datamodel/wotlwedu-registration.model';
import { RegisterService } from '../service/register.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';
import { WotlweduLoaderController } from '../controller/wotlwedu-loader-controller.class';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registrationInProgress: boolean = true;
  registrationComplete: boolean = false;
  userConfirmed: boolean = false;
  loader: WotlweduLoaderController = new WotlweduLoaderController();
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private registerService: RegisterService
  ) {}

  ngOnInit(): void {
    this.loader.stop();
    const urlPath = this.route.snapshot.url[0].path;

    if (urlPath === 'register') {
      this.userConfirmed = false;
      this.registrationComplete = false;
      this.registrationInProgress = true;
    } else if (urlPath === 'confirm') {
      this.registrationInProgress = false;
      this.registrationComplete = false;
      this.userConfirmed = false;

      this.confirmUser(this.route.snapshot.params.registertoken);
    }
  }

  onSubmit(registerForm: NgForm) {
    const registration = new WotlweduRegistration();

    registration.email = registerForm.value.email;
    registration.firstName = registerForm.value.firstName;
    registration.lastName = registerForm.value.lastName;
    registration.alias = registerForm.value.alias;

    this.loader.start();

    this.registerService.register(registration).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err)},
      next: (response) => {
        this.registrationComplete = true;
        this.registrationInProgress = false;
        this.loader.stop();
      },
    });
  }

  confirmUser(token: string) {
    this.loader.start();
    this.registerService.confirm(token).subscribe({
      error: (err) => {
        this.loader.stop();
        this.alertBox.handleError(err);
      },
      next: (response) => {
        this.loader.stop();
        this.userConfirmed = true;
      },
    });
  }

  onClickLogin() {
    this.router.navigate(["/", "auth"])
  }
}
