import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
 Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthDataService } from '../../service/authdata.service';
import * as bcrypt from 'bcryptjs';
import { WotlweduAlert } from '../../controller/wotlwedu-alert-controller.class';

@Component({
  selector: 'app-passwordreset',
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css',
})
export class PasswordResetComponent implements OnInit {
  resetForm: FormGroup;
alertBox: WotlweduAlert = new WotlweduAlert();
  constructor(private router: Router, private route: ActivatedRoute, private authDataService: AuthDataService) {}

  ngOnInit() {
    this.authDataService.reset();
    this.resetForm = new FormGroup({
      newpass: new FormControl('', Validators.required),
      verifypass: new FormControl('', Validators.required),
    });
    this.resetForm.addValidators(
      this.CompareValidator(
        this.resetForm.get('newpass'),
        this.resetForm.get('verifypass')
      )
    );
  }

  CompareValidator(controlOne: AbstractControl, controlTwo: AbstractControl) {
    return () => {
      if (controlOne.value !== controlTwo.value)
        return { nomatch: true };
      return null;
    };
  }

  onSubmit() {
    if( this.resetForm.value.newpass )
    {
      const salt = bcrypt.genSaltSync(12);
      const encryptedPwd = bcrypt.hashSync(this.resetForm.value.newpass, salt);
      
      this.authDataService.resetPassword( this.route.snapshot.params.userid, this.route.snapshot.params.resettoken, encryptedPwd)
      .subscribe({
        error: (err)=>this.alertBox.handleError(err),
        next: (response)=>{
          this.router.navigate(['/auth']);
        }
      })

    }
    else {
      this.alertBox.setErrorMessage("No new password provided");
    }
  }

}
