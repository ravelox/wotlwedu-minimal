import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';
import { GlobalVariable } from '../global';

@Injectable({ providedIn: 'root' })
export class HealthcheckService {
  private ENDPOINT = GlobalVariable.BASE_API_URL + 'ping';

  constructor(private http: HttpClient) {}

  ping() {
    return this.http.get<WotlweduApiResponse>(this.ENDPOINT);
  }
}
