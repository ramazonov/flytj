import {Component, Input} from '@angular/core';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      *ngIf="icon"
      class="icon"
      [attr.width]="width"
      [attr.height]="height"
      [attr.fill]="color"
    >
      <use [attr.href]="'assets/icons.svg#' + icon"></use>
    </svg>
  `,
  styles: [`
    .icon {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `],
  imports: [
    NgIf
  ]
})
export class IconComponent {
  @Input() icon!: string;
  @Input() height: string = '24';
  @Input() width: string = '24';
  @Input() color: string = 'currentColor';
}
