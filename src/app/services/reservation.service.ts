import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError, tap, BehaviorSubject, map, shareReplay, interval, mergeMap } from 'rxjs';
import { IReservation } from 'src/interfaces/reservation.interface';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private _baseUrl = "http://localhost:4200/api";
  // used as single data stream in the APP
  private reservations = new BehaviorSubject<IReservation[]> ([]);

  constructor(private http: HttpClient) { }

  // get all reservations and put the in the stream
  init(): void {
    this.http
      .get<IReservation[]>(`${this._baseUrl}/reservations`)
      .subscribe((resData) => {
        this.reservations.next(resData)
      });
  }

  getAll(): Observable<IReservation[]>{
    return this.reservations;
  }

  // get only reservations for the selected date
  getReserverdHours(date: string): Observable<any> {
    return this.reservations.pipe(
      // get only reservations for the selected date
      map(reservations => reservations.filter((reservation:any) => this.getDate(new Date(reservation.reservationDateTime)) === this.getDate(new Date(date)))),
      map(reservations => reservations.map(x=>x.reservationTime)),
    )
  }

  // Send reservation to backend
  add(reservation: any): Observable<any> {
    return this.http
      .post<any>(`${this._baseUrl}/reservations`, reservation, { observe: "response"})
      .pipe(
        catchError(this.errorHandler)
      );
  }

  // helper functions
  // get the date from datepicker selected date
  getDate(date:any): string | null {
    if (date) {
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let year = date.getFullYear();
      return `${month}/${day}/{year}`;
    }
    return null
  }
  // get the hour in 12h without am pm
  getHour12h(date:any): string | null {
    if (date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      // minutes = minutes < 10 ? '0'+minutes : minutes;
      minutes = ('0'+minutes).slice(-2);
      return `${hours}:${minutes}`;
    }
    return null
  }


  errorHandler(error: HttpErrorResponse){
    return throwError(() => error);
  } 
}