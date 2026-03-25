import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduUser } from '../datamodel/wotlwedu-user.model';
import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { of, Subject } from 'rxjs';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { SharedDataService } from './shareddata.service';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class UserDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduUser[]>();
  details = new Subject<WotlweduUser>();
  refreshFriends = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService,
    private configService: ConfigService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(userId: string) {
    if (!userId || userId === '') return null;
    const url = this.configService.config.apiUrl + 'user/' + userId + '?detail=image';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getSignInMethods(userId: string) {
    if (!userId || userId === '') return of(null);
    const url = this.configService.config.apiUrl + 'user/' + userId + '/signin-method';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getUserAudit(userId: string, items: number = 10) {
    if (!userId || userId === '') return of(null);
    const url =
      this.configService.config.apiUrl +
      'user/' +
      userId +
      '/authaudit?items=' +
      items;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getOrganizationAudit(organizationId: string, outcome?: string, items: number = 20) {
    if (!organizationId || organizationId === '') return of(null);
    const params = ['items=' + items];
    if (outcome && outcome !== 'all') {
      params.push('outcome=' + encodeURIComponent(outcome));
    }
    const url =
      this.configService.config.apiUrl +
      'organization/' +
      organizationId +
      '/authaudit?' +
      params.join('&');
    return this.http.get<WotlweduApiResponse>(url);
  }

  unlinkSignInMethod(userId: string, identityId: string) {
    if (!userId || !identityId) return of(null);
    const url =
      this.configService.config.apiUrl +
      'user/' +
      userId +
      '/signin-method/' +
      identityId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = this.sharedDataService.getItemsPerPage();
    const url =
      this.configService.config.apiUrl + 'user/' +
      '?detail=image&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    return this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduUser[] = response.data.users;
        this.page = response.data.page;
        this.itemsPerPage = response.data.itemsPerPage;
        this.total = response.data.total;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  getFriends(userId: string, showBlocked?: boolean) {
    const url =
      this.configService.config.apiUrl + 'user/' + userId + '/friend' + (showBlocked ? '?blocked=1' : '');
    return this.http.get<WotlweduApiResponse>(url);
  }

  saveUser(userObject: WotlweduUser) {
    if( ! userObject ) return of(null);

    const payload: any = {
      email: userObject.email,
      firstName: userObject.firstName,
      lastName: userObject.lastName,
      alias: userObject.alias,
      active: userObject.active,
      verified: userObject.verified,
      enable2fa: userObject.enable2fa,
      imageId: userObject.image.id,
      admin: userObject.admin,
      systemAdmin: userObject.systemAdmin,
      organizationId: userObject.organizationId,
      organizationAdmin: userObject.organizationAdmin,
      workgroupAdmin: userObject.workgroupAdmin,
      adminWorkgroupId: userObject.adminWorkgroupId,
    };
   
    let url = this.configService.config.apiUrl + 'user/';

    if (userObject.id) {
      url = url + userObject.id;
      return this.http.put<WotlweduApiResponse>(url, payload);
    }
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  deleteUser(userId: string) {
    let url = this.configService.config.apiUrl + 'user/' + userId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduUser) {
    this.details.next(details);
  }

  addFriendByEmail(email: string) {
    if (!email) return of(null);

    let url = this.configService.config.apiUrl + 'user/' + 'request';
    let payload = { email: email };
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  addFriendById(friendId: string) {
    if (!friendId) return of(null);

    let url = this.configService.config.apiUrl + 'user/' + 'request/' + friendId;
    let payload = {};
    return this.http.post<WotlweduApiResponse>(url, payload);
  }

  deleteRelationship(relationshipId: string) {
    if (!relationshipId) return of(null);
    let url = this.configService.config.apiUrl + 'user/' + 'relationship/' + relationshipId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  confirmFriend(tokenId) {
    if (!tokenId) return of(null);
    const url = this.configService.config.apiUrl + 'user/' + 'accept/' + tokenId;
    return this.http.post<WotlweduApiResponse>(url, {});
  }

  blockFriend(userId) {
    if (!userId) return of(null);
    const url = this.configService.config.apiUrl + 'user/' + 'block/' + userId;
    return this.http.put<WotlweduApiResponse>(url, {});
  }
}
