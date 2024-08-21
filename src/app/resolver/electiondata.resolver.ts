import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { ElectionDataService } from "../service/electiondata.service";
import { SharedDataService } from "../service/shareddata.service";

export const electionDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(ElectionDataService).getAllData();
};
