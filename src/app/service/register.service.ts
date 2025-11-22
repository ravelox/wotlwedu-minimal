import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { WotlweduRegistration } from "../datamodel/wotlwedu-registration.model";
import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { ConfigService } from "./config.service";

@Injectable()
export class RegisterService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  register(registration: WotlweduRegistration) {
    const url = this.configService.config.apiUrl + "register";
    return this.http.post<WotlweduApiResponse>(url, registration);
  }

  confirm(token: string) {
    const url =
      this.configService.config.apiUrl + "register" + "/confirm/" + token;
    return this.http.post<WotlweduApiResponse>(url, {});
  }
}
