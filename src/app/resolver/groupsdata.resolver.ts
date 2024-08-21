import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { GroupDataService } from "../service/groupdata.service";
import { SharedDataService } from "../service/shareddata.service";

export const groupsDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(GroupDataService).getAllData();
};
