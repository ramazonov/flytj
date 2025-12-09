import {Component, Injectable} from '@angular/core';
import {MatCalendar} from '@angular/material/datepicker';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {DatePipe} from "@angular/common";
import {NativeDateAdapter} from "@angular/material/core";
import {CapitalizePipe} from '../capitalize.pipe';

@Component({
  selector: 'app-calendar-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, DatePipe, CapitalizePipe],
  template: `
    <div class="custom-header">
      <div class="month-display">
        {{ calendar.activeDate | date: 'MMMM yyyy' | capitalize }}
      </div>
    </div>
  `,
  styles: [`
    .custom-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 10px;
    }

    .month-display {
      font-size: 14px;
      font-weight: 400;
    }

    ::ng-deep mat-calendar .mat-calendar-table thead {
      display: none;
    }
  `]
})

export class CalendarHeaderComponent {
  constructor(public calendar: MatCalendar<Date>) {
  }
}

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  }

  override getMonthNames(): string[] {
    return [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
  }
}
