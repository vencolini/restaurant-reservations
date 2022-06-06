import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Router} from '@angular/router';
import { IReservation } from 'src/interfaces/reservation.interface';
import { ReservationService } from '../services/reservation.service';
import { DataService } from '../services/data.service';
import { interval, map, Observable, of, Subscription, tap } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { SubscriptionsContainer } from '../subscriptions-container';


@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss']
})
export class ReservationComponent implements OnInit, OnDestroy {

  reservations$!: Observable<IReservation[]>
  form$!: Observable<any>;
  subs = new SubscriptionsContainer();

  profileForm: FormGroup = new FormGroup({});
  reservationForm: FormGroup = new FormGroup({});
  // restrict the Datepicket to 24-31 of July
  minDate: Date = new Date('2022/07/24');
  maxDate: Date = new Date('2022/07/31');
  // set when the user go back to edit the reservation
  activeReservation: any;
  // reservationTime used to set the time buttons
  resTime: string = '';
  // to control time selection in tempalte
  timeSlotsArray = [
    { key: "slot1", value: "6:00", reserved: false },
    { key: "slot2", value: "6:30", reserved: false },
    { key: "slot3", value: "7:00", reserved: false },
    { key: "slot4", value: "7:30", reserved: false },
    { key: "slot5", value: "8:00", reserved: false },
    { key: "slot6", value: "8:30", reserved: false },
    { key: "slot7", value: "9:00", reserved: false },
    { key: "slot8", value: "9:30", reserved: false },
    { key: "slot9", value: "10:00", reserved: false }
  ];
  
  timeSlotsArray$ = of(this.timeSlotsArray);
  
  regions = [
    { value: "mainHall", name: "Main Hall", capacity: 12, smokingAllowed: false, childrenAllowed: true },
    { value: "bar", name: "Bar", capacity: 4, smokingAllowed: false, childrenAllowed: false  },
    { value: "riverside", name: "Riverside", capacity: 8, smokingAllowed: false, childrenAllowed: false  },
    { value: "riversideSmoking", name: "Riverside (Smoking Allowed)", capacity: 6, smokingAllowed: true, childrenAllowed: false  },
  ]

  constructor(
    private reservations: ReservationService,
    private dataService: DataService,
    private fb: FormBuilder, 
    private router: Router
    ) {}
 
  ngOnInit(): void {    
    this.buildReservationForm();
    this.setRegionValidators();
    this.checkForActiveReservation();
    // load the reservation data from the api
    this.reservations.init();
    // api call every 2 seccons :) 
    this.subs.add = interval(2000)
      .subscribe(data => {
        this.reservations.init();
      })
  
    this.reservationForm.valueChanges.subscribe((dateTime) => {
      // check for unavailable hours on form changes
      this.getHours();
    })
    // check for unavailable hours on init
    this.getHours();
  }
  

  checkForActiveReservation(): void{
    // load active reservation data from data service store
    this.activeReservation = this.dataService.getForm()
    // if date and time are present in the form
    if (this.activeReservation.reservationDateTime 
          && this.activeReservation.reservationTime) {

      // mark hour as selected
      this.resTime = this.activeReservation.reservationTime;
      // populate the form filds using the form object from data service
      this.reservationForm.patchValue(this.activeReservation);
      // convert from ISO string date to date and show valid date in datepicker
      this.reservationForm.patchValue({
        reservationDateTime: new Date(this.activeReservation.reservationDateTime)
      });
    }
  }

  buildReservationForm ():void {
    this.reservationForm = this.fb.group({
      reservationDateTime: ['', [Validators.required]],
      reservationTime: ['', [Validators.required]],
      userDetails: this.fb.group({
        name: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*'), Validators.minLength(3)]],
        emailAddress: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]],
      }),
      partyDetails: this.fb.group({
        regionPreference: ['', [Validators.required]],
        partySize: 0,
        numberOfChildren: 0,
        hasSmokers: false,
        hasBirthday: false,
        birthdayPersonName: ''
      })
    }); 
  }

  setRegionValidators ():void {
    const regionControl = this.reservationForm.get('partyDetails.regionPreference');
    const partySize = this.reservationForm.get('partyDetails.partySize');
    const children = this.reservationForm.get('partyDetails.numberOfChildren');
    
    regionControl?.valueChanges
      .subscribe(regionPreference => {

        if (regionPreference === 'mainHall') {
          partySize?.setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(1), Validators.max(12)]);
          children?.setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(0), Validators.max(12)]);
          
        }

        if (regionPreference === 'bar') {
          partySize?.setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(1), Validators.max(4)]);
          children?.setValidators([Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(0), Validators.max(4)]);
    
        }

        if (regionPreference === 'riverside') {
          partySize?.setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(1), Validators.max(8)]);
          children?.setValidators([Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(0), Validators.max(8)]);
        }

        if (regionPreference === 'riversideSmoking') {
          partySize?.setValidators([Validators.required, Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(1), Validators.max(6)]);
          children?.setValidators([Validators.pattern(/^-?(0|[1-9]\d*)?$/), Validators.min(0), Validators.max(6)]);
        }
        
        partySize?.updateValueAndValidity();
      });
      
  } 

  toConfirmPage(e:any):void {
    e.preventDefault();
    let finalDate = new Date(this.reservationForm.value.reservationDateTime);

    if(!this.reservationForm.valid) {
      this.reservationForm.markAllAsTouched();
    } else {
      this.reservationForm.patchValue({
        reservationDateTime: finalDate.toISOString()
      });
      let reservationObject: IReservation = this.reservationForm.value;
      this.dataService.addForm(this.reservationForm.value)
      // go to confirm page
      this.router.navigate(['/review-page'], {state: reservationObject});
    }
  }

  populateFormDummyData():void {
    this.reservationForm.patchValue({
      reservationDateTime: '',
      reservationTime: '20:30',
      userDetails: {
        name: 'Alice for testing',
        emailAddress: 'email@email.com',
        phoneNumber: 5556667778
      },
      partyDetails: {
        regionPreference: 'mainHall',
        partySize: 8,
        numberOfChildren: 2,
        hasSmokers: false,
        hasBirthday: true,
        birthdayPersonName: 'Bob'
      }
    });
  }

  guestPerTable(value:string):number {
    let maxTableNumber = this.regions.filter(region => region.value === value)
                                      .map(region => region.capacity);
    return maxTableNumber[0];
  }

  okForChildren(value:string):boolean {
    if(value === 'bar' || value ==='riversideSmoking'){
      // chilrden number to 0
      this.reservationForm.patchValue({
        partyDetails: {
          numberOfChildren: 0
      }});
      return false;
    }
    return true;
  }

  okForSmokers(value:string):boolean {
    if(value ==='riversideSmoking'){
      return true;
    }
    return false;
  }


  updateDateWithTime (time:string): void {
    // take date from datepicker
    // change the time and return back to the form

    const selectedDate = new Date(this.reservationForm.value.reservationDateTime);
    // time convert to be improved if more time available
    const hour = Number(time?.split((':'))[0])+12;
    const minute = Number(time?.split((':'))[1]);
    const dateWithTime = new Date(selectedDate.setHours(hour, minute));
    const reservatinosForSelectedDate = [];
    
    // add the correct time to the form
    this.reservationForm.patchValue({
      reservationDateTime: dateWithTime
    });

    this.reservationForm.patchValue({
      reservationTime: time
    });

  }
  
  getHours():void {
    // pass the reserved date and receive an array with all reserved hours for the date
    this.subs.add = this.reservations.getReserverdHours(this.reservationForm.value.reservationDateTime)
      .subscribe(reservedHours => {
        this.disableReservedHours(reservedHours)
      })
  }
  
  disableReservedHours(reservedHours:any): void {
    this.timeSlotsArray.forEach(slot => {
      if (reservedHours.includes(slot.value)) {
        slot.reserved = true;
        // if selected hour === to a reserved hour delete the time from the form
        // to prevent sending duplicate hours for reservations
        if (this.reservationForm.value.reservationTime === slot.value) {
          this.reservationForm.patchValue({
            reservationTime: ""
          });
        }
        //this.reservationForm.value.reservationTime = "";
      } else {
        slot.reserved = false;
      }
    });
  }

  getDate(date:any): string | null {
    if (date) {
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var year = date.getFullYear();
    return month + "/" + day + "/" + year;
    }
    return null
  }
  

  ngOnDestroy(){
    this.subs.unsubscribe();
  }

  get dateTime() { return this.reservationForm.get('reservationDateTime')} 
  get time() { return this.reservationForm.get('reservationTime')} 
  get name() { return this.reservationForm.get('userDetails.name')}
  get email() { return this.reservationForm.get('userDetails.emailAddress')}
  get phone() { return this.reservationForm.get('userDetails.phoneNumber')}
  get region() { return this.reservationForm.get('partyDetails.regionPreference')}
  get partySize() { return this.reservationForm.get('partyDetails.partySize')}
  get children() { return this.reservationForm.get('partyDetails.numberOfChildren')}
  get reservationDateTime() { return this.reservationForm.value.reservationDateTime }
  get hasBirthday() { return this.reservationForm.value.partyDetails.hasBirthday } 
  get hasSmokers() { return this.reservationForm.value.partyDetails.hasSmokers }

}
