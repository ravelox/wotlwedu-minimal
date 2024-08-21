import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { HealthcheckService } from "../service/healthcheck.service";
import { Router } from "@angular/router";
import { GlobalVariable } from "../global";
import { AuthDataService } from "../service/authdata.service";
import { DataSignalService } from "../service/datasignal.service";

@Component({
  selector: "app-error",
  templateUrl: "./error.component.html",
  styleUrl: "./error.component.css",
})
export class ErrorComponent implements OnInit,OnDestroy, AfterViewInit {
  countdown: number = GlobalVariable.ERROR_COUNTDOWN;
  private _counter;


  constructor(private healthcheck: HealthcheckService, private router: Router, private authDataService: AuthDataService, dataSignalService: DataSignalService) {  }

  ngOnInit(): void {
    this.countdown = GlobalVariable.ERROR_COUNTDOWN;
    this.authDataService.setErrorState();
  }

  ngOnDestroy(): void {
    clearInterval(this._counter);
  }

  ngAfterViewInit(): void {
    this._counter = setInterval(
      this.checkConnectionAndCountdown.bind(this),
      1000
    );
  }

  checkConnectionAndCountdown() {
    this.countdown = this.countdown - 1;
    if (this.countdown === 0) {
      this.healthcheck.ping().subscribe({
        error: (err) => {
          this.countdown = GlobalVariable.ERROR_COUNTDOWN;
        },
        next: (response) => {
          if (response) {
            clearInterval(this._counter);
            this.authDataService.clearErrorState();
            this.router.navigate([GlobalVariable.DEFAULT_START_PAGE]);
          }
        },
      });
    }
  }
}
