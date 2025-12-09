import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {COUNTRIES} from "../../coutries";
import {FormsModule} from "@angular/forms";
import {NgForOf, NgIf} from "@angular/common";
import {ProfileService} from "../services/profile.service";
import {ActivatedRoute} from "@angular/router";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-edit-passenger-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    IconComponent
  ],
  templateUrl: './edit-passenger-modal.component.html',
  styleUrl: './edit-passenger-modal.component.scss'
})
export class EditPassengerModalComponent implements OnChanges, OnInit {
  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() passengerDeletedEvent = new EventEmitter<void>();
  @Output() passengerUpdateEvent = new EventEmitter<void>();
  @Input() passenger: any = {};

  constructor(private profileService: ProfileService, private route: ActivatedRoute) {
  }

  protected readonly countries = COUNTRIES;

  isGenderDropdownOpen: boolean = false;
  isPassportDropdownOpen: boolean = false;
  isCitizenshipDropdownOpen: boolean = false;
  public genders: any[] = [
    {text: 'Мужчина', value: 'M'},
    {text: 'Женщина', value: 'F'}
  ];
  public passports: any[] = [
    {text: 'Загран паспорт', value: 'NP'},
    {text: 'Паспорт РТ', value: 'NP'}
  ];
  public walletPhone: string = "";
  isPassengerEditingLoading: boolean = false;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.walletPhone = params['walletPhone'] || '';
    });
  }

  closeModal() {
    this.closeModalEvent.emit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['passenger']) {
      console.log('Updated passenger:', this.passenger);
    }
  }

  toggleGenderDropdown() {
    this.isGenderDropdownOpen = !this.isGenderDropdownOpen;
  }

  selectGender(genderValue: string) {
    this.passenger.gender = genderValue;
    this.isGenderDropdownOpen = false;
  }

  getGenderText(genderValue: string): string {
    const gender = this.genders.find(g => g.value === genderValue);
    return gender ? gender.text : 'Не выбран';
  }

  togglePassportDropdown() {
    this.isPassportDropdownOpen = !this.isPassportDropdownOpen;
  }

  getPassportText(passportValue: string): string {
    const passport = this.passports.find(p => p.value === passportValue);
    return passport ? passport.text : 'Не выбран';
  }

  selectPassport(passportValue: string) {
    this.passenger.documentType = passportValue;
    this.isPassportDropdownOpen = false;
  }

  toggleCitizenship() {
    this.isCitizenshipDropdownOpen = !this.isCitizenshipDropdownOpen;
  }

  getCitizenshipText(citizenshipValue: string): string {
    const citizenship = this.countries.find(c => c.code === citizenshipValue);
    return citizenship ? citizenship.name : 'Не выбран'
  }

  selectCountry(country: string) {
    this.passenger.citizenShip = country;
    this.isCitizenshipDropdownOpen = false;
  }

  getAgeCategory(birthDate: string): string {
    if (!birthDate) {
      return 'Пассажир';
    }

    const birthYear = new Date(birthDate).getFullYear();
    if (isNaN(birthYear)) {
      return 'Пассажир';
    }
    const currentYear = new Date().getFullYear();

    const age = currentYear - birthYear;

    if (age >= 12) {
      return 'Взрослый';
    } else if (age >= 2) {
      return 'Ребёнок';
    } else {
      return 'Младенец';
    }
  }

  deletePassenger(passengerId: number): void {
    if (!passengerId) return;

    this.isPassengerEditingLoading = true;

    this.profileService.deletePassenger(passengerId).subscribe(
      () => {
        this.isPassengerEditingLoading = false;
        this.passengerDeletedEvent.emit();
        this.closeModal();
      },
      (error) => {
        console.error('Ошибка при удалении пассажира: ', error);
        console.log('Не удалось удалить пассажира');
      }
    )
  }

  saveChanges() {
    if (!this.walletPhone) {
      console.error('WalletPhone отсутствует');
      return;
    }

    const updatedPassenger = {
      ...this.passenger,
      walletPhone: this.walletPhone
    };

    this.isPassengerEditingLoading = true;

    this.profileService.updatePassenger(updatedPassenger).subscribe({
      next: (res) => {
        this.isPassengerEditingLoading = false
        console.log('Passenger updated successfully:', res);
        this.passengerUpdateEvent.emit();
        if (res.statusCode === 200) {
          this.closeModal();
        }
      },
      error: (err) => {
        console.error('Error updating passenger:', err);
      }
    });
  }
}
