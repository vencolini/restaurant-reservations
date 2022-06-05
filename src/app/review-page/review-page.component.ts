import { Component, OnInit, TemplateRef } from '@angular/core';
import { IReservation } from 'src/interfaces/reservation.interface';
import { Router, RouterModule, Routes } from '@angular/router';
import { ReservationService } from '../services/reservation.service';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';
import { throttleTime } from 'rxjs/operators';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { SubscriptionsContainer } from '../subscriptions-container';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-review-page',
  templateUrl: './review-page.component.html',
  styleUrls: ['./review-page.component.scss']
})
export class ReviewPageComponent implements OnInit {

  public reservations$!: Observable<IReservation[]>
  subs = new SubscriptionsContainer();
  data: any;
  // flag to disble the button on sucsessfult reservatoin
  reservationConfirmed: boolean = false;
  // allow only 1 click every X seconds
  private buttonClicked = new Subject<string>();
  private button$!: Observable<any>;
  private buttonSub!: Subscription;

  // confirm modal vars
  modalRef?: BsModalRef;
  message?: string;
  
  constructor(
    private router: Router,
    private reservation: ReservationService,
    private utils: UtilsService,
    private dataService: DataService,
    private modalService: BsModalService
  ) { 
  }

  // can be loaded from API of some sort with translations etc
  descriptions = {
    reservationDateTime: "Reservation Date",
    reservationTime: "Reservation time",
    userDetails: {
      name: "Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone number"
    },
    partyDetails: {
      regionPreference: "Region Preference",
      partySize: "Party Size",
      numberOfChildren: "Number of children",
      hasSmokers: "Has Smokers",
      hasBirthday: "Has Birthday",
      birthdayPersonName: "Birthday Person Name"
    }
  }

  ngOnInit(): void {
    // clone the object because it's lost after ng init
    this.data = this.dataService.getForm()
    // detect important data, if not available navigate to reservations
    if(!this.data.reservationDateTime){
      this.router.navigateByUrl("/reservation");
    }
    // prevent sending multiple requests to API
    this.button$ = this.buttonClicked.pipe(throttleTime(5000));
    // what happens on confirm button click
    this.subs.add = this.button$.subscribe((itemId: string) => {
      // send the data to the API on button click
      this.subs.add = this.reservation.add(this.data).subscribe((response) =>{
        // disable the button if data sent successfuly
        if(response.status === 201){
          // disable the button
          this.reservationConfirmed = true;
          // remove the active reservation from the date store service
          this.dataService.resetForm();
          setTimeout(() => {
            this.router.navigateByUrl("/");
        }, 5000);  //5s
        }
      })
    });
  }

  onConfirmReservation():void {
    this.buttonClicked.next('sendData');
  }

  onEdit(){
    this.router.navigateByUrl("/reservation");
  }

  // confirm modal functions
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }
  confirm(): void {
    this.message = 'Confirmed!';
    this.modalRef?.hide();
    this.router.navigateByUrl("/reservation");
  }
  decline(): void {
    this.message = 'Declined!';
    this.modalRef?.hide();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
