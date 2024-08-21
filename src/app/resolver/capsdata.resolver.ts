import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { CapDataService } from "../service/capdata.service";
import { SharedDataService } from "../service/shareddata.service";

export const capsDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(CapDataService).getAllData();
};
