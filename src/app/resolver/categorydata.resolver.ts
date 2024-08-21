import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { CategoryDataService } from "../service/categorydata.service";
import { SharedDataService } from "../service/shareddata.service";

export const categoryDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(CategoryDataService).getAllData();
};
