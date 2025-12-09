import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'https://bft-alpha.55fly.ru/api/cities'

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
