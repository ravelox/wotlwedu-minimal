import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { NotificationDataService } from "../service/notificationdata.service";
import { DataSignalService } from "../service/datasignal.service";
import { Subscription } from "rxjs";
import { AuthDataService } from "../service/authdata.service";
import { WotlweduPageStackService } from "../service/pagestack.service";
import { HealthcheckService } from "../service/healthcheck.service";
import { GlobalVariable } from "../global";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.css",
})
export class HeaderComponent implements OnInit, OnDestroy {
  unreadCount: number = 0;
  isLoggedIn: boolean = false;
  isErrorState: boolean = false;
  userName: string = null;
  isAdmin: boolean = false;
  appVersion: string = "";
  serverVersion: string = "";
  private _notificationSignal: Subscription;
  private _refreshSignal: Subscription;
  private _errorSignal: Subscription;
  private _authSub: Subscription;
  private _updateInProgress: boolean = false;
  @ViewChild("tooltip") tooltip: ElementRef;
  @ViewChild("navbar") navbar: ElementRef;
  navBarOpen: boolean = false;
  tooltipVisible: boolean = false;

  constructor(
    private router: Router,
    private pageStack: WotlweduPageStackService,
    private notifDataService: NotificationDataService,
    private dataSignalService: DataSignalService,
    private authDataService: AuthDataService,
    private healthcheckService: HealthcheckService
  ) {}

  ngOnInit(): void {
    this.pageStack.setRouter(this.router);
    this._updateInProgress = false;
    this._notificationSignal = this.dataSignalService.hasNotificationSignal.subscribe({
      next: ()=>{
        this.getUnreadCount.bind(this)();
      }
    })

    this.appVersion = GlobalVariable.APP_VERSION;
    this._refreshSignal = this.dataSignalService.refreshDataSignal.subscribe({
      next: () => this.getUnreadCount.bind(this)(),
    });
    this._errorSignal = this.dataSignalService.isErrorSignal.subscribe({
      next: (errStatus) => {
        this.isErrorState = errStatus ? true : false;
      },
    });
    this._authSub = this.authDataService.isLoggedIn.subscribe({
      error: (err) => (this.isLoggedIn = false),
      next: (loginDetails) => {
        if (loginDetails) {
          this.isLoggedIn = loginDetails.loginState;
          this.userName = loginDetails.userName;
          this.isAdmin = loginDetails.isAdmin;

          if (this.isLoggedIn) {
            this.healthcheckService.ping().subscribe({
              next: (response) => {
                if (response && response.data && response.data.version) {
                  this.serverVersion = response.data.version;
                }
              },
            });
          }
        } else {
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.userName = null;
        }
      },
    });

    this.getUnreadCount.bind(this)();
  }

// Called when socket.io event is received
  private getUnreadCount() {
    // Only query for unread notifications when logged in
    // and there isn't a problem talking to the server
    if (!this.isLoggedIn || this.isErrorState) return;

    if (!this._updateInProgress) {
      this._updateInProgress = true;
      this.notifDataService.getUnreadCount().subscribe({
        error: (err) => {
          this._updateInProgress = false;
        },
        next: (response) => {
          this._updateInProgress = false;
          if (
            response &&
            response.data &&
            (response.data.unread || response.data.unread === 0)
          ) {
            this.unreadCount = +response.data.unread;
          }
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this._notificationSignal) this._notificationSignal.unsubscribe();
    if (this._refreshSignal) this._refreshSignal.unsubscribe();
    if (this._errorSignal) this._errorSignal.unsubscribe();
    if (this._authSub) this._authSub.unsubscribe();
  }

  onClickNotifications() {
    this.pageStack.savePage();
    this.router.navigate(["/", "notification"]);
  }

  onClickUserProfile() {
    this.pageStack.savePage();
    this.router.navigate(["/", "profile"]);
  }

  onClickLogo(event) {
    if (!this.isLoggedIn) return;
    event.preventDefault();
    this.tooltipVisible = !this.tooltipVisible;
  }

  onClickMenu() {
    this.navBarOpen = !this.navBarOpen;
  }

  onGoTo(routerLink: string) {
    this.onClickMenu();
    this.router.navigate([routerLink]);
  }
}
