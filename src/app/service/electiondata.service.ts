import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { Subject } from 'rxjs';
import { PreferenceDataService } from './preferencedata.service';
import { WotlweduElection } from '../datamodel/wotlwedu-election.model';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class ElectionDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduElection[]>();
  details = new Subject<WotlweduElection>();
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'election/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(electionId: string) {
    if (!electionId || electionId === '') return null;
    const url =
      this.ENDPOINT + electionId + '?detail=group,list,category,image';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');

    const url =
      this.ENDPOINT +
      '?detail=group,list,category,image' +
      '&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');

    this.http.get<WotlweduApiResponse>(url).subscribe({
      next: (response) => {
        const objects: WotlweduElection[] = response.data.elections;
        this.page = response.data.page;
        this.total = response.data.total;
        this.itemsPerPage = response.data.itemsPerPage;
        this.dataChanged.next(objects.slice());
      },
    });
  }

  getElectionStats(electionId: string) {
    if (!electionId || electionId === '') return null;
    const url = this.ENDPOINT + electionId + '/stats';
    return this.http.get<WotlweduApiResponse>(url);
  }

  saveElection(election: WotlweduElection) {
    const payload = {
      name: election.name,
      description: election.description,
      electionType: election.electionType,
      status: election.status,
      expiration: null,
      groupId: null,
      listId: null,
      categoryId: null,
      imageId: null,
    };

    if (election.group && election.group.id) {
      payload.groupId = election.group.id;
    }
    if (election.list && election.list.id) {
      payload.listId = election.list.id;
    }
    if (election.category && election.category.id) {
      payload.categoryId = election.category.id;
    }
    if (election.image && election.image.id) {
      payload.imageId = election.image.id;
    }
    if (election.expiration) {
      payload.expiration = election.expiration.toISOString();
    }

    let url = this.ENDPOINT;

    if (election.id) {
      url = url + election.id;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteElection(electionId: string) {
    let url = this.ENDPOINT + electionId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  setElectionDetails(details: WotlweduElection) {
    this.details.next(details);
  }

  startElection(electionId: string) {
    let url = this.ENDPOINT + electionId + '/start';
    return this.http.put<WotlweduApiResponse>(url, null);
  }

  stopElection(electionId: string) {
    let url = this.ENDPOINT + electionId + '/stop';
    return this.http.put<WotlweduApiResponse>(url, null);
  }
}
