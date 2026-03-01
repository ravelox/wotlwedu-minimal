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
import { ConfigService } from "../service/config.service";
import { WorkgroupDataService } from "../service/workgroupdata.service";
import { WorkgroupScopeService } from "../service/workgroupscope.service";
import { WotlweduWorkgroup } from "../datamodel/wotlwedu-workgroup.model";

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
  isSystemAdmin: boolean = false;
  isOrganizationAdmin: boolean = false;
  isWorkgroupAdmin: boolean = false;
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
  workgroups: WotlweduWorkgroup[] = [];
  activeWorkgroupId: string = "";

  constructor(
    private router: Router,
    private pageStack: WotlweduPageStackService,
    private notifDataService: NotificationDataService,
    private dataSignalService: DataSignalService,
    private authDataService: AuthDataService,
    private healthcheckService: HealthcheckService,
    private configService: ConfigService,
    private workgroupDataService: WorkgroupDataService,
    private workgroupScope: WorkgroupScopeService
  ) {}

  ngOnInit(): void {
    this.pageStack.setRouter(this.router);
    this._updateInProgress = false;
    this._notificationSignal = this.notifDataService.unreadCountChanged.subscribe({
      next: (count) => {
        this.unreadCount = +(count || 0);
      },
    });

    this.appVersion = this.configService.config.appVersion;
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
          this.isSystemAdmin = loginDetails.isSystemAdmin === true;
          this.isOrganizationAdmin = loginDetails.isOrganizationAdmin === true;
          this.isWorkgroupAdmin = loginDetails.isWorkgroupAdmin === true;
          this.activeWorkgroupId = this.workgroupScope.getActiveWorkgroupId() || "";

          if (this.isLoggedIn) {
            this.notifDataService.refreshUnreadCount();
            this.healthcheckService.ping().subscribe({
              next: (response) => {
                if (response && response.data && response.data.version) {
                  this.serverVersion = response.data.version;
                }
              },
            });

            // Load workgroups for scoping Items/Images/Lists/Elections.
            this.workgroupDataService.listWorkgroups(1, 200).subscribe({
              next: (response) => {
                const list = response?.data?.workgroups || [];
                this.workgroups = Array.isArray(list) ? list : [];

                // Drop stale persisted scope values that are no longer visible.
                const current = this.workgroupScope.getActiveWorkgroupId();
                const currentExists = !!current && this.workgroups.some((workgroup) => workgroup?.id === current);
                const adminWg = loginDetails.adminWorkgroupId || null;
                if (current && !currentExists) {
                  this.workgroupScope.setActiveWorkgroupId(null);
                  this.activeWorkgroupId = "";
                  this.dataSignalService.refreshData();
                } else if (!current && this.isWorkgroupAdmin && adminWg) {
                  this.workgroupScope.setActiveWorkgroupId(adminWg);
                  this.activeWorkgroupId = adminWg;
                } else if (!current && this.workgroups.length === 1 && this.workgroups[0]?.id) {
                  this.workgroupScope.setActiveWorkgroupId(this.workgroups[0].id);
                  this.activeWorkgroupId = this.workgroups[0].id;
                } else {
                  this.activeWorkgroupId = current || "";
                }
              },
            });
          }
        } else {
          this.isLoggedIn = false;
          this.isSystemAdmin = false;
          this.isOrganizationAdmin = false;
          this.isWorkgroupAdmin = false;
          this.userName = null;
          this.workgroups = [];
          this.workgroupScope.setActiveWorkgroupId(null);
          this.activeWorkgroupId = "";
          this.unreadCount = 0;
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
        next: (unread) => {
          this._updateInProgress = false;
          this.unreadCount = +(unread || 0);
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
    this.navBarOpen = false;
    this.tooltipVisible = !this.tooltipVisible;
  }

  onClickMenu(event) {
    event.preventDefault();
    this.tooltipVisible = false;
    this.navBarOpen = !this.navBarOpen;
  }

  onChangeActiveWorkgroup(event: any) {
    const value = event?.target?.value || "";
    this.activeWorkgroupId = value;
    this.workgroupScope.setActiveWorkgroupId(value === "" ? null : value);
    this.dataSignalService.refreshData();
  }

  onGoTo(routerLink: string) {
    this.navBarOpen = false;
    this.router.navigate([routerLink]);
  }
}
