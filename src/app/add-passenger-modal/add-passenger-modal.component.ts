import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {COUNTRIES} from "../../coutries";
import {ProfileService} from "../services/profile.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-add-passenger-modal',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    FormsModule,
    NgForOf,
    NgOptimizedImage
  ],
  templateUrl: './add-passenger-modal.component.html',
  styleUrl: './add-passenger-modal.component.scss'
})
export class AddPassengerModalComponent implements OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() passengerAddedEvent = new EventEmitter<void>();

  public walletPhone: string = "";
  private _firstName: string = "";
  public _surName: string = "";
  public _middleName: string = "";
  public citizenShip: string = "";
  public gender: string = "";
  public type: string = "";
  public documentType: string = "";
  public documentNumber: string = "";
  public email: string = "";
  public phone: string = "";
  public birthDate: string = "";
  public expirationDate: string = "";
  public issueDate: string = "";

  public isValidationTriggered: boolean = false;
  public isGenderDropdownOpen: boolean = false;
  public isPassportDropdownOpen: boolean = false;
  public isCitizenshipDropdownOpen: boolean = false;
  public selectedGender: string = '';
  public selectedCountry: string = '';
  public selectedPassportType: string = '';
  public selectedPassportCode: string | null = null;
  public passports: any[] = [
    {name: 'Загран паспорт', code: 'NP'},
    {name: 'Паспорт РТ', code: 'NP'}
  ];
  public genders: any[] = [
    {text: 'Мужчина', value: 'M',},
    {text: 'Женщина', value: 'F'}
  ]
  protected readonly countries = COUNTRIES;

  isPassengerAddingLoading: boolean = false;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.walletPhone = params['walletPhone'] || '';
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  toggleGenderDropdown(): void {
    this.isGenderDropdownOpen = !this.isGenderDropdownOpen;
  }

  togglePassportDropdown(): void {
    this.isPassportDropdownOpen = !this.isPassportDropdownOpen;
  }

  getGenderText(genderValue: string): string {
    const gender = this.genders.find(g => g.value === genderValue);
    return gender ? gender.text : 'Не выбран';
  }

  selectGender(genderValue: string) {
    this.selectedGender = genderValue;
    this.gender = genderValue;
    this.isGenderDropdownOpen = false;
  }

  selectPassport(passportName: string, code: string): void {
    this.selectedPassportType = passportName;
    this.selectedPassportCode = code;
    this.documentType = code;
    this.isPassportDropdownOpen = false;
  }

  addPassenger() {
    this.isValidationTriggered = true;

    if (
      !this.firstName ||
      !this.surName ||
      !this.documentNumber ||
      !this.phone ||
      !this.gender ||
      !this.citizenShip ||
      !this.birthDate
    ) {
      return;
    }

    if (!this.phone.startsWith('+992')) {
      this.phone = `+992${this.phone}`;
    }

    const passenger = {
      firstName: this.firstName,
      surName: this.surName,
      middleName: this.middleName,
      citizenShip: this.citizenShip,
      gender: this.gender,
      type: this.getPassengerTypeCode(),
      documentType: this.documentType,
      documentNumber: this.documentNumber,
      email: this.email,
      phone: this.phone,
      birthDate: this.birthDate,
      expirationDate: this.expirationDate,
      passportIssueDate: this.issueDate,
      walletPhone: this.walletPhone
    }

    this.isPassengerAddingLoading = true;

    this.profileService.addPassenger(passenger).subscribe({
      next: (res) => {
        this.isPassengerAddingLoading = false;
        this.passengerAddedEvent.emit();
        this.closeModal();
        this.resetForm();
        this.isValidationTriggered = false;
      },
      error: (err) => {
        this.isPassengerAddingLoading = false;
        console.error('Ошибка при добавлении пассажира', err);
        alert(`Ошибка: ${err.message || 'Что-то пошло не так'}`);
      }
    })
  }

  resetForm() {
    this.firstName = '';
    this.surName = '';
    this.middleName = '';
    this.citizenShip = '';
    this.gender = '';
    this.type = '';
    this.documentType = '';
    this.documentNumber = '';
    this.email = '';
    this.phone = '';
    this.birthDate = '';
    this.expirationDate = '';
    this.issueDate = '';
  }

  toggleCitizenship() {
    this.isCitizenshipDropdownOpen = !this.isCitizenshipDropdownOpen;
  }

  selectCountry(country: { name: string, code: string }): void {
    this.selectedCountry = country.name;
    this.citizenShip = country.code;
    this.isCitizenshipDropdownOpen = false;
  }

  getAge(birthDate: string): number | null {
    if (!birthDate) return null;

    // Парсим дату в формате дд.мм.гггг
    const dateParts = birthDate.split('.');
    if (dateParts.length !== 3) return null;

    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1; // Месяцы в объекте Date начинаются с 0
    const year = parseInt(dateParts[2], 10);

    const birthDateObj = new Date(year, month, day);
    if (isNaN(birthDateObj.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    const dayDiff = today.getDate() - birthDateObj.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }


  getPassengerTypeDisplay(): string {
    const age = this.getAge(this.birthDate);
    if (age === null) return "Пассажир";

    if (age < 2) return "Младенец";
    if (age >= 2 && age <= 12) return "Ребёнок";
    if (age > 12) return "Взрослый";

    return "Пассажир";
  }

  getPassengerTypeCode(): string {
    const age = this.getAge(this.birthDate);
    if (age === null) return "";

    if (age < 2) return "ins";
    if (age >= 2 && age <= 12) return "chd";
    if (age > 12) return "adt";

    return "";
  }

  isLatin(value: string): boolean {
    const latinRegex = /^[a-zA-Z]+$/
    return latinRegex.test(value);
  }

  get firstName(): string {
    return this._firstName;
  }

  set firstName(value: string) {
    if (this.isLatin(value)) {
      this._firstName = value.toUpperCase();
    } else {
      this._firstName = '';
    }
  }

  get surName(): string {
    return this._surName || '';
  }

  set surName(value: string) {
    if (this.isLatin(value)) {
      this._surName = value.toUpperCase();
    } else {
      this._surName = '';
    }
  }

  get middleName(): string {
    return this._middleName || '';
  }

  set middleName(value: string) {
    if (this.isLatin(value)) {
      this._middleName = value.toUpperCase();
    } else {
      this._middleName = '';
    }
  }

  onDateInput(event: Event, field: 'birthDate' | 'expirationDate' | 'issueDate'): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/[^\d]/g, '');

    if (value.length >= 2) value = value.slice(0, 2) + '.' + value.slice(2);
    if (value.length >= 5) value = value.slice(0, 5) + '.' + value.slice(5, 9);

    if (value.length > 10) value = value.slice(0, 10);

    this[field] = value;
  }
}
