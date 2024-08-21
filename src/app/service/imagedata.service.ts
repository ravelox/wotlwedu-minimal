import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { of, Subject } from 'rxjs';
import { WotlweduImage } from '../datamodel/wotlwedu-image.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class ImageDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduImage[]>();
  details = new Subject<WotlweduImage>();
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'image/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(imageId: string, notificationId?: string) {
    if (!imageId || imageId === '') return null;
    let url = this.ENDPOINT + imageId;

    if( notificationId ) {
      url = url + "/notif/" + notificationId;
    }
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');
    const url =
      this.ENDPOINT +
      '?detail=category' +
      '&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduImage[] = response.data.images;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  saveImage(imageId: string, name: string, description: string) {
    const payload = {
      name: name,
      description: description,
    };

    let url = this.ENDPOINT;

    if (imageId) {
      url = url + imageId;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteImage(imageId: string) {
    let url = this.ENDPOINT + imageId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  saveImageFile(imageId: string, imageFile: File) {
    let url = this.ENDPOINT + 'file/' + imageId;
    const formData = new FormData();
    let fileExtension = 'jpg';
    if (imageFile.type && imageFile.type.includes('/')) {
      fileExtension = imageFile.type.split('/')[1];
    }
    formData.append('fileextension', fileExtension);
    formData.append('imageUpload', imageFile);
    return this.http.post<WotlweduApiResponse>(url, formData);
  }

  deleteImageFile(imageId: string) {
    let url = this.ENDPOINT + 'file/' + imageId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  shareImage(imageId: string, recipientId: string) {
    if( ! imageId || ! recipientId ) return of(null);
    let url = this.ENDPOINT + 'share/' + imageId + "/recipient/" + recipientId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  acceptImage(notificationId: string) {
    if( ! notificationId ) return of(null);
    let url = this.ENDPOINT + 'accept/' + notificationId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduImage) {
    this.details.next(details);
  }
}
