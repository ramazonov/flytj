import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {ActivatedRoute} from '@angular/router';
import {animate, AnimationEvent, style, transition, trigger} from "@angular/animations";
import {PassengerDataService} from "../services/passenger-data.service";
import {finalize, Observable, tap} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {ModalOrderSucceedComponent} from "../modal-order-succeed/modal-order-succeed.component";
import {ModalStateService} from "../services/modal-state.service";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-order-ticket-modal',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    FormsModule,
    NgForOf,
    ModalOrderSucceedComponent,
    JsonPipe,
    IconComponent
  ],
  templateUrl: './order-ticket-modal.component.html',
  styleUrl: './order-ticket-modal.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: 0}),
        animate('0.15s ease-in', style({transform: 'translateY(0)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('0.15s ease-out', style({transform: 'translateY(100%)', opacity: 0}))
      ])
    ])
  ]
})
export class OrderTicketModalComponent implements OnInit {
  @Input() flight!: any;
  @Input() passengers: {
    children: number;
    adults: number;
    infantsWithSeat: number
  } = {adults: 0, children: 0, infantsWithSeat: 0}
  @Output() detailPassengerSelected = new EventEmitter<any>;
  @Input() isPassengerFormValid: boolean = false;
  @Input() fromCity!: string;
  @Input() toCity!: string;
  @Input() backRouteCity!: string;
  @Input() passengerCount: number = 0;
  @Input() travelClassText!: string;
  @Input() selectedDateText!: string;
  @Input() updatedPassengerData: { name: string, surname: string, birthDate: string; gender: string } = {
    name: '',
    surname: '',
    birthDate: '',
    gender: ''
  };

  private apiUrl = 'https://integration.cbt.tj/api/flytj/book';
  //private apiUrl = 'http://192.168.40.238:9800/api/flytj/book';
  // private apiUrl = 'http://localhost:5273/api/flytj/book';
  passengersList: any[] = [];
  passengersDataList: any[] = [];

  constructor(
    public passengerDataService: PassengerDataService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private modalStateService: ModalStateService
  ) {
  }

  isLoading: boolean = false;
  isValidationTriggered = false;
  isVisible: boolean = false;
  email: string = '';
  phone: string = '';
  walletPhone: string = "123456789";
  validationPopup: boolean = false;
  isDetailModalOpen = true;

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    const modalBlock = document.querySelector('.tickets-modal__block') as HTMLElement;
    if (modalBlock) {
      modalBlock.style.display = '';
    }
    this.isVisible = false;
  }

  selectPassenger(passenger: any, index: number) {
    this.passengerDataService.selectedPassengerIndex = index;
    this.passengerDataService.sendEvent(passenger);
    this.detailPassengerSelected.emit(passenger);

    this.modalStateService.setModalState(false);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['walletPhone']) {
        this.walletPhone = params['walletPhone'];
      }
    });

    this.passengerDataService.getPassengersDataList().subscribe((data) => {
      this.passengersList = data;
    });
    this.passengerDataService.passengerEvent$.subscribe((passengers: any) => {
      this.passengersDataList = [];

      for (let i = 1; i <= passengers.adults; i++) {
        this.passengersDataList.push({
          count: `Пассажир №${i}`,
          type: 'Взрослый',
          passengerType: 'adt',
          isValidPassenger: false,
        });
      }

      for (let i = 1; i <= passengers.children; i++) {
        this.passengersDataList.push({
          count: `Пассажир №${i + passengers.adults}`,
          type: 'Ребёнок',
          passengerType: 'chd',
          isValidPassenger: false,
        });
      }

      for (let i = 1; i <= passengers.infantsWithSeat; i++) {
        this.passengersDataList.push({
          count: `Пассажир №${i + passengers.adults + passengers.children}`,
          type: 'Младенец',
          passengerType: 'inf',
          isValidPassenger: false,
        });
      }
    })

    this.modalStateService.isModalDetailOpen$.subscribe(state => {
      this.isDetailModalOpen = state;
    });
  }

  createOrderRequest() {
    this.isValidationTriggered = true;
    if (!this.isValidForm()) {
      return;
    }

    if (!this.isPassengerValidForm()) {
      this.validationPopup = true;
      return;
    }

    const convertToISO = (dateString: string) => {
      const [day, month, year] = dateString.split('.').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)); // Set to UTC midnight
      return date.toISOString();
    };

    const passengers = this.passengersList.map((passenger, index) => ({
      ...passenger,
      index: index,
      expiration_date: convertToISO(passenger.expiration_date),
      date_of_birth: convertToISO(passenger.date_of_birth),
    }));

    const requestBody = {
      walletPhone: this.walletPhone,
      token: sessionStorage.getItem('token'),
      url: window.location.href,
      session_id: sessionStorage.getItem('sessionId'),
      rec_id: this.flight.value.rec_id,
      partner_fees: this.flight.value.partner_fees.TJS,
      payer_phone: '+992' + this.walletPhone,
      payer_email: this.email,
      passengers: passengers,
      meta: {
        currency: "TJS",
        language: "tj",
      },
      company_req_id: sessionStorage.getItem('company_req_id'),
    };

    try {
      const clonedRequestBody = structuredClone(requestBody);
      console.log("Cloned Request Body: ", clonedRequestBody);
    } catch (e) {
      console.error("Error during cloning:", e);
    }

    this.sendOrderRequest(requestBody).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          window.location.href = response.data.paymentUrl;
        }
      },
      error: (error) => {
        console.error('Ошибка при отправке запроса:', error);
      }
    });
  }

  sendOrderRequest(data: any): Observable<any> {
    this.isLoading = true;
    return this.http.post(this.apiUrl, data).pipe(
      tap({
        next: (response: any) => {
          if (response && response.success) {
            console.log('Заказ успешно создан', response);
          }
        },
        error: (error) => {
          console.error('Ошибка при отправке запроса:', error);
        }
      }),
      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  isValidForm(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(this.email);

    return this.walletPhone.length > 0 && isEmailValid;
  }

  isPassengerValidForm() {
    return this.isPassengerFormValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{9}$/;
    return phoneRegex.test(phone);
  }

  closeValidationPopup() {
    this.validationPopup = false;
  }

  transformGender(passenger: { gender: string }) {
    if (passenger.gender === 'F') {
      passenger.gender = 'Ж';
    } else if (passenger.gender === 'M') {
      passenger.gender = 'М';
    }

    return passenger.gender;
  }

  formatName(passenger: { name: string, surname: string }) {
    if (passenger.name && passenger.surname) {
      return `${passenger.name} ${passenger.surname.charAt(0)}.`;
    }

    return passenger.name || passenger.surname || '';
  }
}
