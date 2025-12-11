import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http: HttpClient) {}

  getPassengers(walletPhone: string): Observable<any> {
    const params = new HttpParams().set('walletPhone', walletPhone);
    return this.http.get<any>(`${environment.cbtBaseUrl}/passenger/list`, {params});
  }

  getTickets(walletPhone: string): Observable<any> {
    const params = new HttpParams().set('walletPhone', walletPhone);
    return this.http.get<any>(`${environment.cbtBaseUrl}/ticket/list`, {params});
  }

  addPassenger(passenger: {
    firstName: string,
    surName: string,
    middleName: string,
    citizenShip: string,
    gender: string,
    type: string,
    documentType: string
    documentNumber: string,
    email: string,
    phone: string,
    birthDate: string,
    expirationDate: string,
    passportIssueDate: string,
    walletPhone: string
  }): Observable<any> {
    const url = `${environment.cbtBaseUrl}/passenger`;
    return this.http.post<any>(url, passenger);
  }

  updatePassenger(updatedPassenger: {
    firstName?: string,
    surName?: string,
    middleName?: string,
    citizenShip?: string,
    gender?: string,
    type?: string,
    documentType?: string
    documentNumber?: string,
    email?: string,
    phone?: string,
    birthDate?: string,
    expirationDate?: string,
    passportIssueDate?: string,
    walletPhone?: string
  }): Observable<any> {
    const url = `${environment.cbtBaseUrl}/passenger/update`
    return this.http.put<any>(url, updatedPassenger)
  }

  deletePassenger(passengerId: number): Observable<any> {
    const url = `${environment.cbtBaseUrl}/passenger/${passengerId}`;
    return this.http.delete<any>(url);
  }
}
