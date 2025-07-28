import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { WotlweduApiResponse } from "../datamodel/wotlwedu-api-response.model";
import { ConfigService } from "./config.service";

@Injectable({ providedIn: "root" })
export class HealthcheckService {
  constructor(private http: HttpClient, private configService: ConfigService) {}

  ping() {
    let url = this.configService.config.apiUrl + "ping";
    return this.http.get<WotlweduApiResponse>(url);
  }
}
