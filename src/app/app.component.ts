import {Component, ViewChild, OnInit, LOCALE_ID} from '@angular/core';
import {RouterOutlet, ActivatedRoute} from '@angular/router';
import {CustomInputComponent} from "./custom-input/custom-input.component";
import {NgClass, NgIf, NgOptimizedImage, registerLocaleData} from "@angular/common";
import {ModalPassengersComponent} from "./modal-passengers/modal-passengers.component";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule} from '@angular/material/core';
import {DirectionFromModalComponent} from './direction-from-modal/direction-from-modal.component'
import {DirectionToModalComponent} from "./direction-to-modal/direction-to-modal.component";
import {FormsModule} from "@angular/forms";
import {HttpClient, HttpParams} from '@angular/common/http';
import {Passengers} from "./models/passengers-type.interface";
import {TicketsModalComponent} from "./tickets-modal/tickets-modal.component";
import {PreorderModalComponent} from "./preorder-modal/preorder-modal.component";
import {Included} from "./models/flights-included.interface";
import {OrderTicketModalComponent} from "./order-ticket-modal/order-ticket-modal.component";
import {DetailPassengerModalComponent} from "./detail-passenger-modal/detail-passenger-modal.component";
import sha512 from 'crypto-js/sha512';
import {format} from 'date-fns';
import dayjs from 'dayjs';
import {ModalOrderSucceedComponent} from "./modal-order-succeed/modal-order-succeed.component";
import {PassengerDataService} from "./services/passenger-data.service";
import localeRu from '@angular/common/locales/ru';
import {ProfileComponent} from "./profile/profile.component";
import {CustomDateAdapter} from "./calendar-header/calendar-header.component";
import {IconComponent} from "./shared/icon/icon.component";
import {DatepickerModalComponent} from "./datepicker-modal/datepicker-modal.component";
import {DatepickerReturnModalComponent} from "./datepicker-return-modal/datepicker-return-modal.component";
import { environment } from '../environments/environment';

registerLocaleData(localeRu);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CustomInputComponent,
    NgOptimizedImage,
    ModalPassengersComponent,
    DatepickerModalComponent,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    DirectionFromModalComponent,
    DirectionToModalComponent,
    FormsModule,
    TicketsModalComponent,
    PreorderModalComponent,
    NgIf,
    OrderTicketModalComponent,
    DetailPassengerModalComponent,
    ModalOrderSucceedComponent,
    ProfileComponent,
    TicketsModalComponent,
    IconComponent,
    NgClass,
    DatepickerModalComponent,
    DatepickerReturnModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    {provide: LOCALE_ID, useValue: 'ru-RU'},
    {provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
    {provide: DateAdapter, useClass: CustomDateAdapter},
  ],
})

export class AppComponent implements OnInit {
  @ViewChild('directionFromModalComponent') directionFromModalComponent!: DirectionFromModalComponent;
  @ViewChild('directionToModalComponent') directionToModalComponent!: DirectionToModalComponent;
  @ViewChild('modalPassengers') modalPassengers!: ModalPassengersComponent;
  @ViewChild('datepickerModalComponent') datepickerModalComponent!: DatepickerModalComponent;
  @ViewChild('ticketsModal') ticketsModal!: TicketsModalComponent;
  @ViewChild('preorderModal') preorderModal!: PreorderModalComponent;
  @ViewChild('orderTicketModal') orderTicketModal!: OrderTicketModalComponent;
  @ViewChild('detailPassengerModal') detailPassengerModal!: DetailPassengerModalComponent;
  @ViewChild('modalOrderSucceed') modalOrderSucceed!: ModalOrderSucceedComponent;

  fromPlaceholder: string = 'Откуда';
  toPlaceholder: string = 'Куда';
  passengers: Passengers = {
    adults: 1,
    children: 0,
    infantsWithSeat: 0,
    travelClass: 'economy'
  }

  tempPassengers: Passengers = {
    adults: 1,
    children: 0,
    infantsWithSeat: 0,
    travelClass: 'economy'
  };

  selectedDateText: string = '';

  selectedDepartureDate: string = '';
  selectedReturnDate: string = '';

  isLoading: boolean = false;
  fromCity: string = 'Душанбе';
  toCity: string = 'Москва';
  backRouteCity: string = '';
  fromAirportCode: string = 'DYU';
  toAirportCode: string = 'MOW';
  flights: any[] = [];
  included: Included | undefined;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  selectedFlight: any;
  selectedPassenger: any;
  isProfileModalOpen: boolean = false;
  isSearchButtonVisible: boolean = true;
  isDateValid: boolean = true;

  passengerCount: number = 0;
  travelClassText: string = '';
  isPassengerFormValid: boolean = false;
  updatedPassengerData: { name: string, surname: string, birthDate: string; gender: string } = {
    name: '',
    surname: '',
    birthDate: '',
    gender: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private passengerDataService: PassengerDataService,
  ) {
  }

  handleSelectedDepartureDate(dates: Date[]) {
    if (!dates || dates.length === 0) {
      this.selectedStartDate = null;
      this.selectedEndDate = null;
      this.selectedDepartureDate = '';
      this.selectedReturnDate = '';
      this.isDateValid = false;
    } else if (dates.length === 1) {
      this.selectedStartDate = dates[0];
      this.selectedEndDate = null;
      this.selectedDepartureDate = this.formatDate(dates[0]);
      this.selectedReturnDate = '';
      this.isDateValid = true;
    } else if (dates.length === 2) {
      this.selectedStartDate = dates[0];
      this.selectedEndDate = dates[1];
      this.selectedDepartureDate = this.formatDate(dates[0]);
      this.selectedReturnDate = this.formatDate(dates[1]);
      this.isDateValid = true;
    }

    this.generateSelectedDateText();
  }

  generateSelectedDateText() {
    if (this.selectedStartDate && this.selectedEndDate) {
      this.selectedDateText = `${this.formatDate(this.selectedStartDate)} — ${this.formatDate(this.selectedEndDate)}`;
    } else if (this.selectedStartDate) {
      this.selectedDateText = this.formatDate(this.selectedStartDate);
    } else {
      this.selectedDateText = 'Дата не выбрана';
    }
  }

  onPassengerDataUpdated(data: { name: string, surname: string, birthDate: string; gender: string }) {
    this.updatedPassengerData = data;
  }

  onValidationStatusChanged(isValid: boolean): void {
    this.isPassengerFormValid = isValid;
  }

  onFlightSelected(flight: any) {
    this.selectedFlight = flight;
    this.preorderModal.openModal(flight);
  }

  orderFlightSelected(flight: any) {
    this.selectedFlight = flight;
    this.orderTicketModal.openModal();
    this.preorderModal.closeModal();
  }

  openDetailPassengerModal(passenger: any) {
    this.selectedPassenger = passenger;
    this.detailPassengerModal?.openModal();
  }

  openDirectionFromModal() {
    this.directionFromModalComponent.openModal();
  }

  openDirectionToModal() {
    this.directionToModalComponent.openModal();
  }

  swapLocations() {
    const tempCode = this.fromAirportCode;
    this.fromAirportCode = this.toAirportCode;
    this.toAirportCode = tempCode;

    const tempCity = this.fromCity;
    this.fromCity = this.toCity;
    this.toCity = tempCity;

    const tempPlaceholder = this.fromPlaceholder;
    this.fromPlaceholder = this.toPlaceholder;
    this.toPlaceholder = tempPlaceholder;
  }

  onDirectionFromSelected(direction: any) {
    this.fromCity = direction.city;
    this.fromAirportCode = direction.airport_code;
  }

  onDirectionToSelected(direction: any) {
    this.toCity = direction.city;
    this.toAirportCode = direction.airport_code;
  }

  openModalPassengers() {
    this.modalPassengers.openModal();
  }

  private getCurrentDate(): string {
    return format(new Date(), 'yyyyMMdd');
  }

  handlePassengersAndClass(event: Passengers) {
    this.tempPassengers = {...event};
    this.calculatePassengerCount();
    this.travelClassText = this.getTravelClassText(event.travelClass);
  }

  private formatDate(date: Date | null): string {
    const day = date?.toLocaleDateString('ru-RU', {day: 'numeric'});
    const month = date?.toLocaleDateString('ru-RU', {month: 'long'}).replace('.', '');

    return `${day} ${month}`;
  }

  private getTravelClassText(travelClass: string): string {
    switch (travelClass.toLowerCase()) {
      case 'economy':
        return 'эконом';
      case 'business':
        return 'бизнес';
      case 'first':
        return 'первый класс';
      default:
        return 'Эконом';
    }
  }

  searchTickets() {
    if (!this.selectedStartDate) {
      this.isDateValid = false;
      return;
    }

    this.isDateValid = true;

    this.isSearchButtonVisible = false;
    this.passengerDataService.sendPassengersEvent(this.tempPassengers);

    this.passengers = {...this.tempPassengers};
    const url = `${environment.mobiBaseUrl}/v1/mobi/search`;
    this.ticketsModal.openModal();
    this.isLoading = true;

    const formattedDate = this.selectedStartDate
      ? dayjs(this.selectedStartDate).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD');

    const companyReqId = sessionStorage.getItem('company_req_id') || environment.companyReqId;
    const flightType = this.selectedEndDate ? 'RT' : 'OW';

    let body = {
      company_req_id: companyReqId,
      language: 'ru',
      flight_type: flightType,
      cabin: this.passengers.travelClass.toLowerCase(),
      passengers: {
          adt: this.passengers.adults,     
          chd: this.passengers.children,   
          inf: 0,
          ins: this.passengers.infantsWithSeat
      },
      routes: [
          {
              from: this.fromAirportCode, 
              to: this.toAirportCode,
              date: formattedDate
          }
      ]
    }

    if (this.selectedEndDate) {
      const formattedReturnDate = dayjs(this.selectedEndDate).format('YYYY-MM-DD');

      body.routes.push({
        from: this.toAirportCode,
        to: this.fromAirportCode,
        date: formattedReturnDate
      });
    }
    
    this.backRouteCity = this.fromCity;

    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      this.http.post(url, body, {headers}).subscribe(
        (response: any) => {
          sessionStorage.setItem('sessionId', response.data.session);
          this.flights = response.data.flights;
          this.included = response.data.included;
          this.isLoading = false;
        },
        (error) => {
          console.error('Search ticket error:', error);
          this.isLoading = false;
        }
      );
    } else {
      console.error('Token is not available.');
      this.isLoading = false;
    }
  }

  private generateSignature(login: string, date: string): string {
    const signatureString = `${login}${ environment.companyReqId}${environment.secretKey}${date}`;
    return sha512(signatureString).toString();
  }

  login(walletPhone: string) {
    const date = this.getCurrentDate();
    const signature = this.generateSignature(walletPhone, date);

    const loginData = {
      date: date,
      company_req_id: environment.companyReqId,
      login: walletPhone,
      signature: signature
    }

    return this.http.post(`${environment.authBaseUrl}/v1/mobi/auth`, loginData).subscribe(
      (response: any) => {
        sessionStorage.setItem('token', response.token);
      },
      (error) => {
        console.error('Login error:', error);
      }
    );
  }

  onTicketsModalClosed() {
    this.isSearchButtonVisible = true;
  }

  ngOnInit() {
    sessionStorage.setItem('company_req_id', String(environment.companyReqId));

    this.route.queryParams.subscribe(params => {
      const walletPhone = params['walletPhone'];
      if (walletPhone) {
        this.login(walletPhone);
      } else {
        console.error('walletPhone не найден в параметрах URL');
      }
    });

    this.calculatePassengerCount();
    this.travelClassText = this.getTravelClassText(this.passengers.travelClass);

    this.isSearchButtonVisible = true;
  };

  private calculatePassengerCount() {
    const {adults, children, infantsWithSeat} = this.passengers;
    this.passengerCount = adults + children + infantsWithSeat;
  }

  openProfileModal() {
    this.isProfileModalOpen = true;
  }

  closeProfileModal() {
    this.isProfileModalOpen = false;
  }
}
