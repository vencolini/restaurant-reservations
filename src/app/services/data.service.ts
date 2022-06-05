import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReservation } from 'src/interfaces/reservation.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }


  private _reservationForm = new BehaviorSubject<IReservation[]>([]);
  readonly reservationForm$ = this._reservationForm.asObservable();


  getForm() {
    return this._reservationForm.getValue();
  }

  addForm(data:any) {
    this.setForm(data);
  }

  resetForm() {
    this.setForm([]);
  }

  setForm(data:any) {
    this._reservationForm.next(data);
  }
  
}
