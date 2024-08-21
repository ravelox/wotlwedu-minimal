import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { PreferenceDataService } from '../service/preferencedata.service';

export const prefdataResolver: ResolveFn<any> = (route, state) => {
 return inject(PreferenceDataService).getAllData();
};