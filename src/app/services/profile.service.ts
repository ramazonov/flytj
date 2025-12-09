import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'https://integration.cbt.tj/api/flytj/passenger';
  private apiTicketsUrl = 'https://integration.cbt.tj/api/flytj/ticket';

  constructor(private http: HttpClient) {
  }

  getPassengers(walletPhone: string): Observable<any> {
    const params = new HttpParams().set('walletPhone', walletPhone);
    return this.http.get<any>(`${this.apiUrl}/list`, {params});
  }

  getTickets(walletPhone: string): Observable<any> {
    const params = new HttpParams().set('walletPhone', walletPhone);
    return this.http.get<any>(`${this.apiTicketsUrl}/list`, {params});
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
    const url = `${this.apiUrl}`
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
    const url = `${this.apiUrl}/update`
    return this.http.put<any>(url, updatedPassenger)
  }

  deletePassenger(passengerId: number): Observable<any> {
    const url = `${this.apiUrl}/${passengerId}`;
    return this.http.delete<any>(url);
  }
}
