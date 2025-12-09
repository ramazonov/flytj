import {Component, EventEmitter, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {animate, style, transition, trigger, AnimationEvent} from "@angular/animations";
import {Passengers} from "../models/passengers-type.interface";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-modal-passengers',
  standalone: true,
  imports: [
    NgIf,
    IconComponent
  ],
  templateUrl: './modal-passengers.component.html',
  styleUrl: './modal-passengers.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(100%)', opacity: 0}),
        animate('0.10s ease-in', style({transform: 'translateY(0)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('0.10s ease-out', style({transform: 'translateY(100%)', opacity: 0}))
      ])
    ])
  ]
})

export class ModalPassengersComponent {
  @Output() selectPassengersAndClass = new EventEmitter<Passengers>();

  public isVisible = false;
  public isAnimating = false;
  public selectedClass: string = 'economy';
  public adults: number = 1;
  public children: number = 0;
  public infantsWithSeat: number = 0;

  public tempSelectedClass: string = this.selectedClass;
  public tempAdults: number = this.adults;
  public tempChildren: number = this.children;
  public tempInfantsWithSeat: number = this.infantsWithSeat;

  confirmSelection() {
    this.selectedClass = this.tempSelectedClass;
    this.adults = this.tempAdults;
    this.children = this.tempChildren;
    this.infantsWithSeat = this.tempInfantsWithSeat;

    this.selectPassengersAndClass.emit({
      adults: this.adults,
      children: this.children,
      infantsWithSeat: this.infantsWithSeat,
      travelClass: this.selectedClass
    });
    this.isVisible = false;
    this.isAnimating = true;
  }

  openModal() {
    this.tempSelectedClass = this.selectedClass;
    this.tempAdults = this.adults;
    this.tempChildren = this.children;
    this.tempInfantsWithSeat = this.infantsWithSeat;
    this.isVisible = true;
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

  selectClass(flightClass: string) {
    this.selectedClass = flightClass
  }

  increaseAdults() {
    if (this.tempAdults < 8) {
      this.tempAdults++;
    }
  }

  decreaseAdults() {
    if (this.tempAdults >= 1) {
      this.tempAdults--;
    }
  }

  increaseChildren() {
    if (this.tempChildren < 8) {
      this.tempChildren++;
    }
  }

  decreaseChildren() {
    if (this.tempChildren >= 0) {
      this.tempChildren--;
    }
  }

  increaseInfantsWithSeat() {
    if (this.tempInfantsWithSeat < 8) {
      this.tempInfantsWithSeat++;
    }
  }

  decreaseInfantsWithSeat() {
    if (this.tempInfantsWithSeat >= 0) {
      this.tempInfantsWithSeat--;
    }
  }
}
