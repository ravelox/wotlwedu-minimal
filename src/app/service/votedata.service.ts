import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { of, Subject } from 'rxjs';
import { PreferenceDataService } from './preferencedata.service';
import { WotlweduPagination } from '../datamodel/wotlwedu-pagination.model';
import { GlobalVariable } from '../global';
import { WotlweduVote } from '../datamodel/wotlwedu-vote.model';
import { SharedDataService } from './shareddata.service';

@Injectable({ providedIn: 'root' })
export class VoteDataService extends WotlweduPagination {
  dataChanged = new Subject<WotlweduVote[]>();
  details = new Subject<WotlweduVote>();
  refreshVotes = new Subject<boolean>();
  private ENDPOINT = GlobalVariable.BASE_API_URL + 'vote/';

  constructor(
    private http: HttpClient,
    private sharedDataService: SharedDataService
  ) {
    super();
    this.setCallbackFunction(this.getAllData);
  }

  getData(voteId: string) {
    if (!voteId || voteId === '') return null;
    const url = this.ENDPOINT + voteId;
    return this.http.get<WotlweduApiResponse>(url);
  }

  getAllData(filter?: string) {
    this.filterUpdate(filter);
    this.itemsPerPage = +this.sharedDataService.getPreference('itemsperpage');
    const url =
      this.ENDPOINT +
      '?' +
      'detail=user,item,election,image' +
      '&page=' +
      this.page +
      '&items=' +
      this.itemsPerPage +
      (this.currentFilter.length > 0
        ? '&filter=' + encodeURIComponent(this.currentFilter)
        : '');
    return this.http.get<WotlweduApiResponse>(url).subscribe((response) => {
      if (response) {
        const objects: WotlweduVote[] = response.data.votes;
        this.page = response.data.page;
        this.total = response.data.total;
        this.dataChanged.next(objects.slice());
      }
    });
  }

  getNextVote(electionId: string) {
    const url = this.ENDPOINT + electionId + '/next';
    return this.http.get<WotlweduApiResponse>(url);
  }

  saveVote(voteObject: WotlweduVote) {
    const payload = {
      userId: null,
      electionId: null,
      itemId: null,
      decision: voteObject.status.id,
    };

    if (voteObject.election && voteObject.election.id) {
      payload.electionId = voteObject.election.id;
    }
    if (voteObject.user && voteObject.user.id) {
      payload.userId = voteObject.user.id;
    }
    if (voteObject.item && voteObject.item.id) {
      payload.itemId = voteObject.item.id;
    }

    let url = this.ENDPOINT;

    if (voteObject.id) {
      url = url + voteObject.id;
      return this.http.post<WotlweduApiResponse>(url, payload);
    }
    return this.http.put<WotlweduApiResponse>(url, payload);
  }

  deleteVote(voteId: string) {
    let url = this.ENDPOINT + voteId;
    return this.http.delete<WotlweduApiResponse>(url);
  }

  getMyVotes() {
    let url = this.ENDPOINT + 'next/all';
    return this.http.get<WotlweduApiResponse>(url);
  }

  setData(details: WotlweduVote) {
    this.details.next(details);
  }

  reset() {
    this.details.next(null);
  }

  refresh() {
    this.refreshVotes.next(true);
  }

  cast(voteId: string, decision: string) {
    if (!voteId || !decision) return of(null);
    let url = GlobalVariable.BASE_API_URL + 'cast/' + voteId + '/' + decision;
    return this.http.get<WotlweduApiResponse>(url);
  }
}
