import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { ListDataService } from "../service/listdata.service";
import { SharedDataService } from "../service/shareddata.service";

export const listDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(ListDataService).getAllData();
};
