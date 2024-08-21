import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { VoteDataService } from "../service/votedata.service";
import { SharedDataService } from "../service/shareddata.service";

export const voteDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(VoteDataService).getAllData();
};
