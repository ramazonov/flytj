import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges
} from '@angular/core';
import {JsonPipe, KeyValuePipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {animate, AnimationEvent, style, transition, trigger} from "@angular/animations";
import {FormsModule} from "@angular/forms";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-tickets-modal',
  standalone: true,
  imports: [
    NgIf,
    NgOptimizedImage,
    NgForOf,
    KeyValuePipe,
    JsonPipe,
    FormsModule,
    NgClass,
    IconComponent,
  ],
  templateUrl: './tickets-modal.component.html',
  styleUrl: './tickets-modal.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: 0}),
        animate('0.2s ease-in', style({transform: 'translateY(0)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('0.2s ease-out', style({transform: 'translateY(100%)', opacity: 0}))
      ])
    ])
  ]
})
export class TicketsModalComponent implements OnChanges {
  @Input() flights: any[] = ['flights'];
  @Input() fromCity!: string;
  @Input() toCity!: string;
  @Input() backRouteCity!: string;
  @Input() isLoading!: boolean;
  @Output() flightSelected = new EventEmitter<any>();
  @Input() passengerCount: number = 0;
  @Input() travelClassText: string = '';
  @Input() selectedDateText: string = '';
  @Output() modalClosed = new EventEmitter<void>();

  isVisible: boolean = false;
  departureAirport: any;
  arrivalAirport: any;
  flightDuration: string = '';
  public isBookingInfoModal: boolean = false;
  public isModalBookingVisible: boolean = true;

  public isFilterVisible: boolean = false;
  public isFilterAnimating = false;

  public minPrice: number | null = null;
  public maxPrice: number | null = null;
  public selectedRefund: string = '';
  public selectedChange: string = '';
  public selectedTransfer: string = '';
  public selectedTimeFrom: string = '';
  public selectedTimeTo: string = '';

  private originalFlights: any[] = [];
  filteredFlights = [...this.flights];

  public routes: any[] = [
    {
      index: 0,
      duration: 16800,
      segments: [
        {
          departure: {time: "20.10.2024 08:00", airport: "DYU", city: "Душанбе", terminal: ""},
          arrival: {time: "20.10.2024 10:40", airport: "NYC", city: "Нью-Йорк", terminal: ""},
          baggage: "20KG",
        },
      ],
    },
  ];
  public hours: number[] = Array.from({length: 24}, (_, i) => i);
  public isDropdownTimeOpen = {from: false, to: false};

  constructor() {
    this.originalFlights = [...this.flights];
    this.initializeFlightData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['flights']) {
      this.originalFlights = [...this.flights];
      this.filteredFlights = [...this.flights];
    }
  }

  closeFilterModal() {
    if (!this.isFilterAnimating) {
      this.isFilterVisible = false;
      this.isFilterAnimating = true;
    }
  }

  onAnimationFilterModal(event: AnimationEvent) {
    if (event.phaseName === 'done') {
      this.isFilterAnimating = false;
      if (event.toState === 'void') {
        this.isFilterVisible = false;
      }
    }
  }

  selectFlight(flight: any) {
    this.flightSelected.emit(flight);
  }

  openModal() {
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
    this.modalClosed.emit();
  }

  initializeFlightData() {
    const firstRoute = this.routes[0];
    const firstSegment = firstRoute.segments[0];

    this.departureAirport = firstSegment.departure;

    this.arrivalAirport = firstSegment.arrival;

    const hours = Math.floor(firstRoute.duration / 3600);
    const minutes = Math.floor((firstRoute.duration % 3600) / 60);
    this.flightDuration = `${hours}ч ${minutes}мин`;
  }

  convertDuration(duration: number): string {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor(duration % 3600) / 60;

    let result = 'В пути ';

    if (hours > 0) {
      result += `${hours} ч `;
    }

    if (minutes > 0) {
      result += `${minutes} мин`
    }

    return result.trim();
  }

  extractHours(time: string): string {
    return time.split(' ')[1]
  }

  openBookingInfoModal() {
    const ticketModalBlock = document.querySelector('.tickets-modal__block');
    if (ticketModalBlock) {
      ticketModalBlock.classList.add('overflow-hidden');
      ticketModalBlock.classList.add('h-100');
    }

    this.isBookingInfoModal = true;
  }

  closeBookingInfoModal() {
    const ticketModalBlock = document.querySelector('.tickets-modal__block');
    if (ticketModalBlock) {
      ticketModalBlock.classList.remove('overflow-hidden');
      ticketModalBlock.classList.remove('h-100')
    }

    this.isBookingInfoModal = false;
  }

  openFilterModal() {
    this.isFilterVisible = true;
  }

  getTransferCount(segments: any[]): number {
    return segments.length - 1;
  }

  applyFilters() {
    this.filteredFlights = this.originalFlights.filter(flight => {
      const flightPrice = flight?.total_price?.TJS;
      const flightRefund = flight?.routes?.[0]?.segments?.[0]?.is_refund;
      const flightExchange = flight?.routes?.[0]?.segments?.[0]?.is_change;
      const flightTransfers = flight?.routes?.[0]?.segments || [];
      const transferCount = this.getTransferCount(flightTransfers);

      const isPriceInRange =
        (!this.minPrice || flightPrice >= this.minPrice) &&
        (!this.maxPrice || flightPrice <= this.maxPrice);

      const isRefundMatch =
        this.selectedRefund === '' ||
        (this.selectedRefund === 'С возвратом' && flightRefund === true) ||
        (this.selectedRefund === 'Без возврата' && flightRefund === false);

      const isChangeMatch =
        this.selectedChange === '' ||
        (this.selectedChange === 'С обменом' && flightExchange === true) ||
        (this.selectedChange === 'Без обмена' && flightExchange === false);

      const isTransferMatch =
        this.selectedTransfer === '' ||
        (this.selectedTransfer === 'Прямой рейс' && transferCount === 0) ||
        (this.selectedTransfer === '1 пересадка' && transferCount === 1) ||
        (this.selectedTransfer === '2 пересадки' && transferCount === 2) ||
        (this.selectedTransfer === '3 пересадки' && transferCount === 3);

      const firstRoute = flight.routes?.[0];
      const firstSegment = firstRoute?.segments?.[0];

      if (!firstSegment || !firstSegment.departure) return false;

      const arrivalTimeRaw = firstSegment.departure.time;
      const arrivalTimeParts = this.extractHours(arrivalTimeRaw);
      const [arrivalHour, arrivalMinute] = arrivalTimeParts.split(':').map(num => parseInt(num, 10));

      const timeFrom = this.selectedTimeFrom ? (this.selectedTimeFrom !== '' ? parseInt(this.selectedTimeFrom, 10) : 0) : 0;
      const timeTo = this.selectedTimeTo ? (this.selectedTimeTo !== '' ? parseInt(this.selectedTimeTo, 10) : 24) : 24;


      const isTimeInRange = this.isTimeInRange(arrivalHour, arrivalMinute, timeFrom, timeTo);

      return isPriceInRange && isRefundMatch && isChangeMatch && isTransferMatch && isTimeInRange;
    });

    this.closeFilterModal();
  }

  isTimeInRange(arrivalHour: number, arrivalMinute: number, timeFrom: number, timeTo: number): boolean {
    const timeFromInMinutes = timeFrom * 60;
    const timeToInMinutes = timeTo * 60;

    const arrivalTimeInMinutes = arrivalHour * 60 + arrivalMinute;

    return arrivalTimeInMinutes >= timeFromInMinutes && arrivalTimeInMinutes <= timeToInMinutes;
  }

  toggleChange(changeType: string): void {
    this.selectedChange = this.selectedChange === changeType ? '' : changeType;
  }

  toggleRefund(changeType: string): void {
    this.selectedRefund = this.selectedRefund === changeType ? '' : changeType;
  }

  toggleTransfer(changeType: string): void {
    this.selectedTransfer = this.selectedTransfer === changeType ? '' : changeType;
  }

  toggleTimeDropdown(type: 'from' | 'to') {
    this.isDropdownTimeOpen[type] = !this.isDropdownTimeOpen[type];
  }

  selectTime(type: 'from' | 'to', hour: any): void {
    if (type === 'from') {
      this.selectedTimeFrom = hour.toString();
    } else {
      this.selectedTimeTo = hour.toString();
    }
    this.isDropdownTimeOpen[type] = false;
  }
}
