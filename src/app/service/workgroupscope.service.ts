import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

const STORAGE_KEY = "wotlwedu-active-workgroup";

@Injectable({ providedIn: "root" })
export class WorkgroupScopeService {
  private readonly _activeWorkgroupId$ = new BehaviorSubject<string | null>(
    localStorage.getItem(STORAGE_KEY)
  );

  get activeWorkgroupId$() {
    return this._activeWorkgroupId$.asObservable();
  }

  getActiveWorkgroupId(): string | null {
    return this._activeWorkgroupId$.value;
  }

  setActiveWorkgroupId(id: string | null) {
    if (!id) {
      localStorage.removeItem(STORAGE_KEY);
      this._activeWorkgroupId$.next(null);
      return;
    }
    localStorage.setItem(STORAGE_KEY, id);
    this._activeWorkgroupId$.next(id);
  }
}

