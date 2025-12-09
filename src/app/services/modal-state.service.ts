import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ModalStateService {
  private isModalDetailOpen = new BehaviorSubject<boolean>(true);
  isModalDetailOpen$ = this.isModalDetailOpen.asObservable();

  setModalState(isOpen: boolean): void {
    this.isModalDetailOpen.next(isOpen);
  }
}
