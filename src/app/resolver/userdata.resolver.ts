import { ResolveFn } from '@angular/router';
import { UserDataService } from '../service/userdata.service';
import { inject } from '@angular/core';
import { SharedDataService } from '../service/shareddata.service';

export const userdataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(UserDataService).getAllData();
};