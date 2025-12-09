import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {JsonPipe, NgForOf, NgIf} from "@angular/common";
import {animate, AnimationEvent, style, transition, trigger} from "@angular/animations";
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from "@angular/material/datepicker";
import {FormsModule} from "@angular/forms";
import {PassengerDataService} from "../services/passenger-data.service";
import {COUNTRIES} from '../../coutries';
import {ProfileService} from "../services/profile.service";
import {ActivatedRoute} from "@angular/router";
import {ModalStateService} from "../services/modal-state.service";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-detail-passenger-modal',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    FormsModule,
    JsonPipe,
    IconComponent,
  ],
  templateUrl: './detail-passenger-modal.component.html',
  styleUrl: './detail-passenger-modal.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({bottom: '-100%'}),
        animate('400ms ease-in-out', style({bottom: '0'})),
      ]),
      transition(':leave', [
        animate('400ms ease-in-out', style({bottom: '-100%'})),
      ]),
    ]),
  ],
})
export class DetailPassengerModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Input() passenger: any = {};
  @Output() validationStatusChanged = new EventEmitter<any>();
  @Output() passengerDataUpdated = new EventEmitter<{
    name: string,
    surname: string,
    birthDate: string;
    gender: string
  }>();

  selectedPassenger: any;

  public isValidationTriggered: boolean = false;
  public isValidationExpirationTriggered: boolean = false;
  public isVisible: boolean = false;
  public openDropdownPassport: boolean = false;
  public selectedGender: string = '';
  public selectedCountry: string = '';
  public selectedCountryCode: string = '';
  selectedDate: string = '';
  selectedDocumentExpireDate: string = '';
  public selectedPassportType: string = '';
  selectedPassportCode: string | null = null;
  passengerDataList: any[] = [];
  public countries = COUNTRIES;
  public birthDate: string = "";
  selectedIndex: number = 0;
  isGenderDropdownOpen: boolean = false;
  public passports: any[] = [
    {name: 'Загран паспорт', code: 'NP'},
    {name: 'Паспорт РТ', code: 'NP'}
  ];
  public genders: any[] = [
    {text: 'Мужчина', value: 'M',},
    {text: 'Женщина', value: 'F'}
  ];
  walletPhone: string = '';
  profileDataList: any[] = [];
  public isPassengersModal: boolean = false;
  public isCitizenshipDropdownOpen: boolean = false;
  public isPassengerLoading: boolean = false;
  public isMiddleNameValidated: boolean = false;

  constructor(
    public passengerDataService: PassengerDataService,
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private modalStateService: ModalStateService
  ) {
  }

  isValidDate(dateString: string): boolean {
    const regex = /^([0-2]\d|3[0-1])\.(0\d|1[0-2])\.\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [day, month, year] = dateString.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;
  }

  formatDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 8);

    if (value.length > 4) {
      value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + '.' + value.slice(2);
    }

    input.value = value;
    this.selectedDate = value;
  }

  formatExpirationDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 8);

    if (value.length > 4) {
      value = value.slice(0, 2) + '.' + value.slice(2, 4) + '.' + value.slice(4);
    } else if (value.length > 2) {
      value = value.slice(0, 2) + '.' + value.slice(2);
    }

    input.value = value;
    this.selectedDocumentExpireDate = value;
  }

  selectGender(gender: { text: string, value: string }): void {
    this.selectedGender = gender.value;
    this.passengerDataList[this.selectedIndex].gender = gender.value;
    this.isGenderDropdownOpen = false;
  }

  selectCountry(country: { name: string, code: string }): void {
    this.selectedCountry = country.name;
    this.passengerDataList[this.selectedIndex].citizenship = country.code;
    this.isCitizenshipDropdownOpen = false;
  }

  selectPassport(passportName: string, code: string): void {
    this.selectedPassportType = passportName;
    this.selectedPassportCode = code;
    this.openDropdownPassport = false;
    this.passengerDataList[this.selectedIndex].document_type = code;
  }

  toggleCitizenship(): void {
    this.isCitizenshipDropdownOpen = !this.isCitizenshipDropdownOpen;
  }

  togglePassportDropdown(): void {
    this.openDropdownPassport = !this.openDropdownPassport;
  }

  closeModal() {
    this.isVisible = false;
    this.modalStateService.setModalState(true);
  }

  openModal() {
    this.isVisible = true;
  }

  ngOnInit(): void {
    this.passengerDataService.event$.subscribe((passenger: any) => {
      this.selectedPassenger = passenger
      const index = this.passengerDataService.selectedPassengerIndex ?? 0;
      this.selectedIndex = index;

      if (!this.passengerDataList[index]) {
        this.passengerDataList[index] = {
          name: '',
          surname: '',
          middle_name: '',
          type: passenger.passengerType,
          citizenship: this.selectedCountryCode || this.passengerDataList[this.selectedIndex]?.citizenship,
          gender: this.selectedGender || this.passengerDataList[this.selectedIndex]?.gender,
          document_type: this.selectedPassportType || this.passports[0]?.name,
          document_number: '',
          date_of_birth: '',
          expiration_date: '',
          phone: '',
          email: ''
        };
      }
    })

    if (this.passports.length > 0) {
      this.selectedPassportType = this.passports[0].name;
      this.selectedPassportCode = this.passports[0].code;
    }

    const tajikistan = this.countries.find(country => country.name === 'Таджикистан');
    if (tajikistan) {
      this.selectedCountry = tajikistan.name;
      this.selectedCountryCode = tajikistan.code;
    }

    this.route.queryParams.subscribe(params => {
      this.walletPhone = params['walletPhone'] || '';
    });
  }

  get name(): string {
    return this.passengerDataList[this.selectedIndex]?.name || '';
  }

  set name(value: string) {
    if (this.isLatin(value)) {
      this.passengerDataList[this.selectedIndex].name = value.toUpperCase();
    } else {
      this.passengerDataList[this.selectedIndex].name = '';
    }
  }

  get surname(): string {
    return this.passengerDataList[this.selectedIndex]?.surname || '';
  }

  set surname(value: string) {
    if (this.isLatin(value)) {
      this.passengerDataList[this.selectedIndex].surname = value.toUpperCase();
    } else {
      this.passengerDataList[this.selectedIndex].surname = '';
    }
  }

  get middleName(): string {
    return this.passengerDataList[this.selectedIndex]?.middle_name || '';
  }

  set middleName(value: string) {
    if (this.isLatin(value)) {
      this.passengerDataList[this.selectedIndex].middle_name = value.toUpperCase();
    } else {
      this.passengerDataList[this.selectedIndex].middle_name = '';
    }
  }

  savePassengerData() {
    this.isValidationTriggered = true;
    this.isValidationExpirationTriggered = true;

    const passenger = this.passengerDataList[this.selectedIndex];
    passenger.date_of_birth = this.formatDateToDDMMYYYY(passenger.date_of_birth);
    passenger.expiration_date = this.formatDateToDDMMYYYY(passenger.expiration_date);

    if (!this.isValidDate(passenger.date_of_birth) ||
      !this.isValidDate(passenger.expiration_date) ||
      !this.isValidForm()) {
      return;
    }

    this.checkValidationStatus();

    if (this.passengerDataService.selectedPassengerIndex != null) {
      if (!this.passengerDataList[this.passengerDataService.selectedPassengerIndex].phone.startsWith('+992')) {
        this.passengerDataList[this.passengerDataService.selectedPassengerIndex].phone = `+992${this.passengerDataList[this.passengerDataService.selectedPassengerIndex].phone}`;
      }

      this.passengerDataList[this.passengerDataService.selectedPassengerIndex] = {
        ...this.passengerDataList[this.passengerDataService.selectedPassengerIndex],
        document_type: this.selectedPassportCode,
        citizenship: this.selectedCountryCode,
      }
    }

    this.updatePassengerData();
    this.selectedPassenger.isValidPassenger = true;
    this.passengerDataService.setPassengersDataList(this.passengerDataList);
    this.closeModal();
  }

  isLatin(value: string): boolean {
    const latinRegex = /^[a-zA-Z]+$/
    return latinRegex.test(value);
  }

  isValidForm(): boolean {
    const currentPassenger = this.passengerDataList[this.selectedIndex]

    if (!currentPassenger) return false;

    const isNameValid = currentPassenger.name && this.isLatin(currentPassenger.name);
    const isSurnameValid = currentPassenger.surname && this.isLatin(currentPassenger.surname);

    return (
      isNameValid &&
      isSurnameValid &&
      currentPassenger.citizenship &&
      currentPassenger.gender &&
      currentPassenger.document_type &&
      currentPassenger.document_number &&
      currentPassenger.expiration_date &&
      currentPassenger.date_of_birth &&
      currentPassenger.phone &&
      currentPassenger.email
    )
  }

  isPhoneValid(): boolean {
    const phone = this.passengerDataList[this.selectedIndex]?.phone;
    const normalizedPhone = phone?.startsWith('+992') ? phone.slice(4) : phone;
    return normalizedPhone && normalizedPhone.length === 9 && /^\d+$/.test(normalizedPhone);
  }

  checkValidationStatus(): void {
    if (this.isValidForm()) {
      this.validationStatusChanged.emit(true);
    }
  }

  toggleGenderDropdown(): void {
    this.isGenderDropdownOpen = !this.isGenderDropdownOpen;
  }

  getGenderText(genderValue: string): string {
    const gender = this.genders.find(g => g.value === genderValue);
    return gender ? gender.text : 'Не выбран';
  }

  openPassengersModal(): void {
    this.isPassengerLoading = true;
    this.profileService.getPassengers(this.walletPhone).subscribe({
      next: (data) => {
        this.profileDataList = data.data;
        this.isPassengersModal = true;
        this.isPassengerLoading = false;
      },
      error: (err) => {
        console.error('Error loading profile:', err);
      }
    })
  }

  closePassengerModal() {
    this.isPassengersModal = false;
  }

  formatDateToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';

    if (/^([0-2]\d|3[0-1])\.(0\d|1[0-2])\.\d{4}$/.test(dateString)) {
      return dateString;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  choosePassenger(passenger: any) {
    if (!this.passengerDataList[this.selectedIndex]) {
      this.passengerDataList[this.selectedIndex] = {};
    }

    this.passengerDataList[this.selectedIndex] = {
      ...this.passengerDataList[this.selectedIndex],
      name: passenger.firstName || '',
      surname: passenger.surName || '',
      middle_name: passenger.middleName || '',
      date_of_birth: this.formatDateToDDMMYYYY(passenger.birthDate) || '',
      phone: passenger.phone || '',
      email: passenger.email || '',
      gender: passenger.gender || '',
      document_type: passenger.documentType || '',
      document_number: passenger.documentNumber || '',
      expiration_date: this.formatDateToDDMMYYYY(passenger.expirationDate) || '',
      citizenship: passenger.citizenShip || '',
      walletPhone: passenger.walletPhone || ''
    };

    this.selectedGender = passenger.gender || '';
    this.selectedCountry = this.countries.find(c => c.code === passenger.citizenShip)?.name || '';
    this.selectedCountryCode = passenger.citizenShip || '';

    this.updatePassengerData();
    this.isPassengersModal = false;
  }

  updatePassengerData() {
    if (!this.passengerDataList[this.selectedIndex]) return;

    const passenger = this.passengerDataList[this.selectedIndex];
    this.passengerDataUpdated.emit({
      birthDate: passenger.date_of_birth || '',
      gender: passenger.gender || '',
      name: passenger.name || '',
      surname: passenger.surname || ''
    });
  }
}
