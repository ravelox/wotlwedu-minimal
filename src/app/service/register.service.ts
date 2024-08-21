import { Injectable } from '@angular/core';
import { GlobalVariable } from '../global';
import { HttpClient } from '@angular/common/http';
import { WotlweduRegistration } from '../datamodel/wotlwedu-registration.model';
import { WotlweduApiResponse } from '../datamodel/wotlwedu-api-response.model';

@Injectable()
export class RegisterService {
  private ENDPOINT: string = GlobalVariable.BASE_API_URL + 'register';

  constructor(private http: HttpClient) {}

  register(registration: WotlweduRegistration) {
    const url = this.ENDPOINT;
    return this.http.post<WotlweduApiResponse>(url, registration);
  }

  confirm(token: string) {
    const url = this.ENDPOINT + "/confirm/" + token;
    return this.http.get<WotlweduApiResponse>(url);
  }
}
