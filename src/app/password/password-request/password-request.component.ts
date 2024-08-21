import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../../service/authdata.service';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-passwordrequest',
  templateUrl: './password-request.component.html',
  styleUrl: './password-request.component.css',
})
export class PasswordRequestComponent implements OnInit {
  requestInProgress: boolean = true;
  requestActioned: boolean = false;
  isProcessing: boolean = false;
  alertBox: WotlweduAlert = new WotlweduAlert();

  constructor(private authDataService: AuthDataService) {}

  ngOnInit(): void {
    this.requestInProgress = true;
    this.requestActioned = false;
    this.isProcessing = false;
  }

  onSubmit(resetForm: NgForm) {
    const email = resetForm.value.email;

    this.isProcessing = true;
    this.authDataService.requestPasswordReset(email).subscribe({
      error: (err) => this.alertBox.handleError(err),
      next: (response) => {
        this.isProcessing = false;
        this.requestInProgress = false;
        this.requestActioned = true;
      },
    });
  }
}
