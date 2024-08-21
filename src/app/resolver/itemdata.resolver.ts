import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { ItemDataService } from "../service/itemdata.service";
import { SharedDataService } from "../service/shareddata.service";

export const itemDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(ItemDataService).getAllData();
};
