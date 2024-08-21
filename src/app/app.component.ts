import { Component, OnInit } from "@angular/core";
import { AuthDataService } from "./service/authdata.service";
import { SharedDataService } from "./service/shareddata.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  constructor(
    private authDataService: AuthDataService,
    private sharedDataService: SharedDataService
  ) {}

  ngOnInit() {
    this.authDataService.autoLogin();

    this.authDataService.isLoggedIn.subscribe({
      next: (details) => {

        if (details && details.loginState === true) {
          this.sharedDataService.refresh();
        }
      },
    });
  }
}
