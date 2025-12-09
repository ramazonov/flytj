import {Component} from '@angular/core';
import {DatePipe, NgForOf, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatFormField} from "@angular/material/form-field";
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerToggle, MatDateRangeInput, MatDateRangePicker
} from "@angular/material/datepicker";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-custom-datepicker',
  standalone: true,
  imports: [
    NgForOf,
    DatePipe,
    NgIf,
    MatButton,
    MatFormField,
    MatDatepickerToggle,
    MatDatepicker,
    MatDatepickerInput,
    MatInput,
    MatDateRangePicker,
    MatDateRangeInput
  ],
  templateUrl: './custom-date-picker.component.html',
  styleUrl: './custom-date-picker.component.scss'
})
export class CustomDatePickerComponent {
  public isVisible = false;
  public selectedDate: Date | null | undefined;

  closeModal() {
    this.isVisible = false;
  }

  // onDateChange(event: MatDatepickerInputEvent<Date>) {
  //   this.selectedDate = event.value;
  // }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.selectedDate = event.value ?? null;
  }
}
