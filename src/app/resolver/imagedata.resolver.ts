import { ResolveFn } from "@angular/router";
import { inject } from "@angular/core";
import { ImageDataService } from "../service/imagedata.service";
import { SharedDataService } from "../service/shareddata.service";

export const imageDataResolver: ResolveFn<any> = (route, state) => {
  inject(SharedDataService).loadPrefAsync();
  return inject(ImageDataService).getAllData();
};
