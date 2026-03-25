import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthDataService } from '../service/authdata.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { WotlweduAlert } from '../controller/wotlwedu-alert-controller.class';
import { ConfigService } from '../service/config.service';

declare global {
  interface Window {
    google?: any;
  }
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {
  alertBox: WotlweduAlert = new WotlweduAlert();
  showPassword: boolean = false;
  googleEnabled: boolean = false;
  inviteToken: string = "";
  inviteDetails: any = null;
  inviteLoading: boolean = false;
  private googleScript?: HTMLScriptElement;
  @ViewChild("passwordinput") passwordInput: ElementRef;
  @ViewChild("googleButtonHost") googleButtonHost?: ElementRef<HTMLDivElement>;

  constructor(
    private authService: AuthDataService,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {}

  onSubmit(authForm: NgForm) {
    this.authService
      .login(authForm.value.email, authForm.value.password)
      .subscribe({
        next: (response) => {
          this.authService.setLoggedIn(true);
          return this.router.navigate([this.configService.config.defaultStartPage]);
        },
        error: (err) => {
          this.alertBox.handleError(err);
          return of(err);
        },
      });
  }

  async ngOnInit() {
    this.authService.reset();
    this.googleEnabled = !!this.configService.config?.googleClientId;
    this.inviteToken = this.route.snapshot.queryParamMap.get("invite") || "";

    if (this.inviteToken) {
      this.inviteLoading = true;
      this.authService.getInvite(this.inviteToken).subscribe({
        next: (response) => {
          this.inviteLoading = false;
          this.inviteDetails = response?.data?.invite || null;
        },
        error: (err) => {
          this.inviteLoading = false;
          this.alertBox.handleError(err);
        },
      });
    }
  }

  onTogglePassword() {
    this.showPassword = !this.showPassword;
    this.passwordInput.nativeElement.type = ( this.showPassword ? "text" : "password")
  }

  ngAfterViewInit() {
    if (!this.googleEnabled) return;
    this.loadGoogleButton();
  }

  ngOnDestroy() {
    if (this.googleScript) {
      this.googleScript.removeEventListener("load", this.renderGoogleButton);
    }
  }

  private loadGoogleButton() {
    if (window.google?.accounts?.id) {
      this.renderGoogleButton();
      return;
    }

    const existingScript = document.querySelector(
      'script[data-google-gsi="true"]'
    ) as HTMLScriptElement | null;
    if (existingScript) {
      this.googleScript = existingScript;
      existingScript.addEventListener("load", this.renderGoogleButton);
      return;
    }

    this.googleScript = document.createElement("script");
    this.googleScript.src = "https://accounts.google.com/gsi/client";
    this.googleScript.async = true;
    this.googleScript.defer = true;
    this.googleScript.dataset.googleGsi = "true";
    this.googleScript.addEventListener("load", this.renderGoogleButton);
    document.head.appendChild(this.googleScript);
  }

  private renderGoogleButton = () => {
    if (!this.googleButtonHost?.nativeElement || !window.google?.accounts?.id) return;

    this.googleButtonHost.nativeElement.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: this.configService.config.googleClientId,
      callback: (response: any) => this.onGoogleCredential(response),
    });
    window.google.accounts.id.renderButton(this.googleButtonHost.nativeElement, {
      theme: "outline",
      size: "large",
      text: "signin_with",
      width: 280,
      shape: "pill",
    });
  };

  private onGoogleCredential(response: any) {
    this.authService.loginGoogle(response?.credential, this.inviteToken || undefined).subscribe({
      next: () => {
        this.authService.setLoggedIn(true);
        return this.router.navigate([this.configService.config.defaultStartPage]);
      },
      error: (err) => {
        this.alertBox.handleError(err);
        return of(err);
      },
    });
  }
}
