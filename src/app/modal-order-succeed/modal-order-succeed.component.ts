import {Component} from '@angular/core';
import {NgIf} from "@angular/common";
import {IconComponent} from "../shared/icon/icon.component";

@Component({
  selector: 'app-modal-order-succeed',
  standalone: true,
  imports: [
    NgIf,
    IconComponent
  ],
  templateUrl: './modal-order-succeed.component.html',
  styleUrl: './modal-order-succeed.component.scss'
})
export class ModalOrderSucceedComponent {
  public isVisible: boolean = true;

  backToHome() {
    this.isVisible = true;
  }
}
