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
  private _unreadInterval;
  private _refreshSignal: Subscription;
  private _errorSignal: Subscription;
  private _authSub: Subscription;
  private _updateInProgress: boolean = false;
  @ViewChild("tooltip") tooltip: ElementRef;
  @ViewChild("navbar") navbar: ElementRef;
  navBarOpen: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private pageStack: WotlweduPageStackService,
    private notifDataService: NotificationDataService,
    private dataSignalService: DataSignalService,
    private authDataService: AuthDataService
  ) {}

  ngOnInit(): void {
    this.pageStack.setRouter(this.router);
    this._updateInProgress = false;
    this._unreadInterval = setInterval(this.getUnreadCount.bind(this), 60000);
    this._refreshSignal = this.dataSignalService.refreshDataSignal.subscribe({
      next: () => this.getUnreadCount(),
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
        } else {
          this.isLoggedIn = false;
          this.isAdmin = false;
          this.userName = null;
        }
      },
    });

    this.getUnreadCount();
  }

  private getUnreadCount() {
    // Only query for unread notifications when logged in
    // and there isn't a problem talking to the server
    if (!this.isLoggedIn || this.isErrorState ) return;

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
    if (this._unreadInterval) clearInterval(this._unreadInterval);
    if (this._refreshSignal) this._refreshSignal.unsubscribe();
    if (this._errorSignal) this._errorSignal.unsubscribe();
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
    if( ! this.isLoggedIn ) return;
    event.preventDefault();
    this.tooltip.nativeElement.style.opacity = 1;
    setTimeout(() => {
      document.addEventListener("click", this.dismissTooltip.bind(this), {
        once: true,
      });
    }, 10);
  }

  dismissTooltip(event) {
    event.preventDefault();
    this.tooltip.nativeElement.style.opacity = 0;
  }

  onClickMenu() {
    this.navBarOpen = !this.navBarOpen;
    this.navbar.nativeElement.style.right=( this.navBarOpen ? "0" : "-100%" );
  }

  onGoTo(routerLink: string) {
    this.onClickMenu();
    this.router.navigate([ routerLink ]);
  }
}
