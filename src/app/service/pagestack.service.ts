import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class WotlweduPageStackService {
  private _pagesBack: any[];
  private _router: Router;

  constructor(private configService: ConfigService) {}

  reset() {
    this._pagesBack = [];
  }

  setRouter(router: Router) {
    this._router = router;
  }

  back() {
    if (!this._pagesBack) {
      this._pagesBack = [];
      this._router.navigate([this.configService.config.defaultStartPage]);
      return;
    }
    const pageToGoTo = this._pagesBack.pop();
    if (pageToGoTo) {
      this._router.navigate(pageToGoTo);
    } else {
      this._router.navigate([this.configService.config.defaultStartPage]);
    }
  }

  savePage() {
    let pageToAdd = new URL(document.URL).pathname.split("/").slice(1);
    if (!this._pagesBack) {
      this._pagesBack = [];
    }
    this._pagesBack.push(pageToAdd);
  }
}
