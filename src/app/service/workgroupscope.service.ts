import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

const STORAGE_KEY = "wotlwedu-active-workgroup";

@Injectable({ providedIn: "root" })
export class WorkgroupScopeService {
  private static normalizeId(id: string | null | undefined): string | null {
    if (typeof id !== "string") {
      return null;
    }

    const normalized = id.trim();
    if (
      normalized === "" ||
      normalized.toLowerCase() === "undefined" ||
      normalized.toLowerCase() === "null"
    ) {
      return null;
    }

    return normalized;
  }

  private readonly _activeWorkgroupId$ = new BehaviorSubject<string | null>(
    WorkgroupScopeService.normalizeId(localStorage.getItem(STORAGE_KEY))
  );

  constructor() {
    const activeWorkgroupId = this._activeWorkgroupId$.value;
    if (activeWorkgroupId) {
      localStorage.setItem(STORAGE_KEY, activeWorkgroupId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  get activeWorkgroupId$() {
    return this._activeWorkgroupId$.asObservable();
  }

  getActiveWorkgroupId(): string | null {
    return this._activeWorkgroupId$.value;
  }

  setActiveWorkgroupId(id: string | null) {
    const normalizedId = WorkgroupScopeService.normalizeId(id);
    if (!normalizedId) {
      localStorage.removeItem(STORAGE_KEY);
      this._activeWorkgroupId$.next(null);
      return;
    }
    localStorage.setItem(STORAGE_KEY, normalizedId);
    this._activeWorkgroupId$.next(normalizedId);
  }
}
