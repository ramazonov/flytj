import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = `${environment.mobiBaseUrl}/v1/mobi/cities`; 

  constructor(private http: HttpClient) {
  }

  // @ts-ignore
  searchCities(value: string): Observable<any> {
    const body = {
      company_req_id: 26,
      language: 'ru',
      value: value,
      limit: 10
    }
    return this.http.post(this.apiUrl, body)
  }
}
