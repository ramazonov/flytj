import {Component} from '@angular/core';
import {NgIf} from "@angular/common";
import {animate, AnimationEvent, style, transition, trigger} from "@angular/animations";
import {FormsModule} from "@angular/forms";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-filter-tickets',
  standalone: true,
    imports: [
        NgIf,
        FormsModule,
        IconComponent
    ],
  templateUrl: './filter-tickets.component.html',
  styleUrl: './filter-tickets.component.scss',
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
export class FilterTicketsComponent {

  public isFilterVisible: boolean = false;
  public isFilterAnimating = false;
  public minPrice: number | null = null;
  public maxPrice: number | null = null;

  closeModal() {
    if (!this.isFilterAnimating) {
      this.isFilterVisible = false;
      this.isFilterAnimating = true;
    }
  }

  openModal() {
    if (!this.isFilterAnimating) {
      this.isFilterVisible = true;
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
}
