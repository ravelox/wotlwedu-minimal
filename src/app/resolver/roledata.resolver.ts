import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { RoleDataService } from "../service/roledata.service";
import { SharedDataService } from "../service/shareddata.service";

export const roleDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(RoleDataService).getAllData();
};
