import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {AnimationEvent} from "@angular/animations";
import {CityService} from "../services/city-service.service";
import {debounceTime, switchMap, catchError} from 'rxjs/operators';
import {of, Subject} from "rxjs";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-direction-from-modal',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    NgIf,
    NgClass,
    IconComponent
  ],
  templateUrl: './direction-from-modal.component.html',
  styleUrl: './direction-from-modal.component.scss'
})

export class DirectionFromModalComponent {
  private searchSubject: Subject<string> = new Subject<string>();
  public flightRoutes = [
    {
      city: 'Душанбе',
      country: 'Республика Таджикистан',
      airport_code: 'DYU'
    },
    {
      city: 'Куляб',
      country: 'Республика Таджикистан',
      airport_code: 'TJU'
    },
    {
      city: 'Худжанд',
      country: 'Республика Таджикистан',
      airport_code: 'LBD'
    },
    {
      city: 'Бохтар',
      country: 'Республика Таджикистан',
      airport_code: 'KQT'
    },
    {
      city: 'Москва',
      country: 'Российская Федерация (Россия)',
      airport_code: 'MOW',
      airports: [
        {
          city: 'Быково',
          airport_code: 'BKA'
        },
        {
          city: 'Шереметьево',
          airport_code: 'SVO'
        },
        {
          city: 'Внуково',
          airport_code: 'VKO'
        },
        {
          city: 'Домодедово',
          airport_code: 'DME'
        },
        {
          city: 'Жуковсикй',
          airport_code: 'ZIA'
        },
      ]
    },
    {
      city: 'Алматы',
      country: 'Казахстан',
      airport_code: 'ALA',
    },
    {
      city: 'Стамбул',
      country: 'Тугрция',
      airport_code: 'IST',
    },
    {
      city: 'Дубай',
      country: 'Объединенные Арабские Эмираты',
      airport_code: 'DXB',
    },
  ];
  public filteredDirections = [...this.flightRoutes];
  public searchTerm = '';
  public isVisible = false;
  public isAnimating = false;
  public isLoading = false;

  @Output() selectDirection = new EventEmitter<any>();
  @ViewChild('searchFromInput') searchFromInput!: ElementRef;
  searchInput: any;

  constructor(private cityService: CityService) {
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTermTrimmed) => {
      this.performSearch(searchTermTrimmed);
    });
  }

  private performSearch(searchTermTrimmed: string) {
    this.isLoading = true;

    if (searchTermTrimmed.length > 0) {
      this.cityService.searchCities(searchTermTrimmed).subscribe({
        next: (res) => {
          console.log(res.data);
          this.filteredDirections = res.data.map((item: any) => ({
            city: item.item.ru || item.item.tj,
            airport_code: item.item_code,
            airports: item.airports.map((airport: any) => ({
              city: airport.airport.ru,
              airport_code: airport.airport_code,
            })),
            country: item.country.ru || item.country.tj,
          }));
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Ошибка при поиске городов:', err);
          this.isLoading = false;
        },
      });
    } else {
      this.filteredDirections = [...this.flightRoutes];
      this.isLoading = false;
    }
  }

  onSearchChange() {
    const searchTermTrimmed = this.searchTerm.trim();
    this.searchSubject.next(searchTermTrimmed);
  }

  chooseDirection(direction: any) {
    this.selectDirection.emit(direction);
    this.closeModal();
  }

  resetSearch() {
    this.searchTerm = '';
    this.filteredDirections = [...this.flightRoutes];
    this.isLoading = false
  }

  openModal() {
    this.isVisible = true;
    this.isAnimating = false;

    setTimeout(() => {
      this.searchInput = document.getElementById('searchFromInput');
      (this.searchInput as HTMLInputElement).focus();
    }, 100)
  }

  closeModal() {
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.isVisible = false;
    }
  }

  onAnimationEvent(event: AnimationEvent) {
    if (event.phaseName === 'done' && event.toState === 'void') {
      this.isVisible = false;
      this.isAnimating = false;
    }
  }
}
