import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {JsonPipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {AddPassengerModalComponent} from "../add-passenger-modal/add-passenger-modal.component";
import {ProfileService} from "../services/profile.service";
import {EditPassengerModalComponent} from "../edit-passenger-modal/edit-passenger-modal.component";
import {ActivatedRoute} from "@angular/router";
import {IconComponent} from "../shared/icon/icon.component";
import {PdfService} from "../services/pdf.service";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    AddPassengerModalComponent,
    NgForOf,
    EditPassengerModalComponent,
    NgOptimizedImage,
    JsonPipe,
    IconComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();

  public selectedTab: string = 'my-tickets';
  public isVisible: boolean = false;
  profileDataList: any[] = [];
  ticketsDataList: any[] = [];
  parsedBookDataList: any[] = [];
  walletPhone: string = '';
  showEditPassengerModal: boolean = false;
  showAddPassengerModal: boolean = false;
  passenger = {};

  readonly TicketStatus = {
    Book: 1,
    Ticketing: 2,
    Success: 3,
    Failed: 4,
    CancelBook: 5,
    ExpiredBook: 6
  };

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private pdfService: PdfService
  ) {
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  getStatusText(status: number): string {
    switch (status) {
      case this.TicketStatus.Book:
        return 'Бронирование';
      case this.TicketStatus.Ticketing:
        return 'Оформление';
      case this.TicketStatus.Success:
        return 'Оформлен';
      case this.TicketStatus.Failed:
        return 'Ошибка';
      case this.TicketStatus.CancelBook:
        return 'Отменен';
      case this.TicketStatus.ExpiredBook:
        return 'Просрочен';
      default:
        return 'Неизвестный статус';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case this.TicketStatus.Success:
        return 'status-success';
      case this.TicketStatus.Failed:
        return 'status-failed';
      case this.TicketStatus.CancelBook:
      case this.TicketStatus.ExpiredBook:
        return 'status-warning';
      default:
        return 'status-info';
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.walletPhone = params['walletPhone'] || '';
      this.loadProfile();
      this.loadTickets();
    });
  }

  loadProfile(): void {
    this.profileService.getPassengers(this.walletPhone).subscribe({
      next: (data) => {
        this.profileDataList = data.data;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    })
  }

  loadTickets(): void {
    this.profileService.getTickets(this.walletPhone).subscribe({
      next: (data) => {
        console.log(data);
        this.ticketsDataList = data.data;
        this.parsedBookDataList = this.ticketsDataList.map((ticket) => {
          const parsed = JSON.parse(ticket.bookData);
          parsed.createdDateTime = ticket.createdDateTime;
          parsed.status = ticket.status;
          return parsed;
        });
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
      }
    });
  }

  selectItem(item: string) {
    this.selectedTab = item;
  }

  addPassengerModal() {
    this.showAddPassengerModal = true;
  }

  closeAddPassengerModal() {
    this.showAddPassengerModal = false;
  }

  openEditPassengerModal(passenger: any): void {
    this.passenger = passenger;
    this.showEditPassengerModal = true;
  }

  closeEditPassengerModal(): void {
    this.showEditPassengerModal = false;
  }

  getAirlineName(ticket: any, supplierCode: string): string {
    return ticket.data.included.supplier[supplierCode]?.name?.ru || supplierCode;
  }

  isDirectFlight(ticket: any): boolean {
    return ticket.data.routes[0].segments.length === 1;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long'});
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

  downloadTicket(ticket: any) {
    try {
      const passengerData = this.profileDataList.length > 0 ? this.profileDataList[0] : {};
      this.pdfService.generateTicketPdf(ticket, passengerData).then(r => {
        console.log(r);
      });
    } catch (error) {
      console.error('Ошибка при генерации PDF:', error);
    }
  }
}
