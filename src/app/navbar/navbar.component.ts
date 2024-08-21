import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthDataService } from '../service/authdata.service';
import { GlobalVariable } from '../global';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  loggedInUserName: string = null;
  isAdmin: boolean = false;
  private loginStatusSub: Subscription;

  constructor(
    private authDataService: AuthDataService,
  ) {}

  ngOnInit() {
    this.loginStatusSub = this.authDataService.isLoggedIn.subscribe({
      next: (loginDetails) => {
        if (loginDetails) {
          this.isLoggedIn = loginDetails.loginState;
          this.loggedInUserName = loginDetails.userName;
          this.isAdmin = loginDetails.isAdmin;
        } else {
          this.isLoggedIn = false;
          this.loggedInUserName = null;
          this.isAdmin = false;
        }
      },
    });
  }

  ngOnDestroy() {
    if (this.loginStatusSub) this.loginStatusSub.unsubscribe();
  }
}
