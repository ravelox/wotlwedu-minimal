import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { ConfigService } from './config.service';

@Injectable({ providedIn: 'root' })
export class AIDataService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  getElectionRecommendations(electionId: string) {
    const url =
      this.configService.config.apiUrl +
      'ai/election/' +
      electionId +
      '/recommendations';
    return this.http.get<WotlweduApiResponse>(url);
  }

  suggestListItems(prompt: string, count?: number) {
    const url = this.configService.config.apiUrl + 'ai/list/suggest-items';
    return this.http.post<WotlweduApiResponse>(url, { prompt, count });
  }

  getElectionSummary(electionId: string) {
    const url =
      this.configService.config.apiUrl + 'ai/election/' + electionId + '/summary';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getNotificationDigest() {
    const url = this.configService.config.apiUrl + 'ai/notification/digest';
    return this.http.get<WotlweduApiResponse>(url);
  }

  suggestParticipants(electionId: string, limit?: number) {
    let url =
      this.configService.config.apiUrl +
      'ai/election/' +
      electionId +
      '/suggest-participants';
    if (limit) {
      url += '?limit=' + limit;
    }
    return this.http.get<WotlweduApiResponse>(url);
  }

  categorizeText(text: string) {
    const url = this.configService.config.apiUrl + 'ai/item/categorize';
    return this.http.post<WotlweduApiResponse>(url, { text });
  }

  moderateText(text: string) {
    const url = this.configService.config.apiUrl + 'ai/moderate';
    return this.http.post<WotlweduApiResponse>(url, { text });
  }

  describeImage(imageId: string) {
    const url = this.configService.config.apiUrl + 'ai/image/' + imageId + '/describe';
    return this.http.get<WotlweduApiResponse>(url);
  }

  getSmartDefaults() {
    const url = this.configService.config.apiUrl + 'ai/preferences/defaults';
    return this.http.get<WotlweduApiResponse>(url);
  }

  assistantQuery(query: string) {
    const url = this.configService.config.apiUrl + 'ai/assistant/query';
    return this.http.post<WotlweduApiResponse>(url, { query });
  }
}
