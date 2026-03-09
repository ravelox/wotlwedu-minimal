import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthDataService } from "../../service/authdata.service";
import { WotlweduAlert } from "../../controller/wotlwedu-alert-controller.class";
import { CompareValidator } from "../../validator/compare.validator";

@Component({
  selector: "app-passwordreset",
  templateUrl: "./password-reset.component.html",
  styleUrl: "./password-reset.component.css",
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
  alertBox: WotlweduAlert = new WotlweduAlert();
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authDataService: AuthDataService
  ) {}

  ngOnInit() {
    this.authDataService.reset();
    this.resetForm = new FormGroup({
      newpass: new FormControl("", Validators.required),
      verifypass: new FormControl("", Validators.required),
    });
    this.resetForm.addValidators(
      new CompareValidator().validate(
        this.resetForm.get("newpass"),
        this.resetForm.get("verifypass")
      )
    );
  }

  onSubmit() {
    if (this.resetForm.value.newpass) {
      this.authDataService
        .resetPassword(
          this.route.snapshot.params.userid,
          this.route.snapshot.params.resettoken,
          this.resetForm.value.newpass
        )
        .subscribe({
          error: (err) => this.alertBox.handleError(err),
          next: (response) => {
            this.router.navigate(["/auth"]);
          },
        });
    } else {
      this.alertBox.setErrorMessage("No new password provided");
    }
  }
}
