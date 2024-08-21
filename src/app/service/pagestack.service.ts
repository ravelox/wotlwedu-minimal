import { Injectable } from "@angular/core";
import { ActivatedRoute, Router, UrlSegment } from "@angular/router";
import { GlobalVariable } from "../global";

@Injectable({ providedIn: "root" })
export class WotlweduPageStackService {
  private _pagesBack: any[];
  private _router: Router;

  constructor() {}

  reset() {
    this._pagesBack = [];
  }

  setRouter(router: Router) {
    this._router = router;
  }

  back() {
    if (!this._pagesBack) {
      this._pagesBack = [];
      this._router.navigate([GlobalVariable.DEFAULT_START_PAGE]);
      return;
    }
    const pageToGoTo = this._pagesBack.pop();
    if (pageToGoTo) {
      this._router.navigate(pageToGoTo);
    } else {
      this._router.navigate([GlobalVariable.DEFAULT_START_PAGE]);
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
