export interface IReservation {
  id: string,
  reservationDateTime: string,
  reservationTime: string,
  userDetails: {
    name: string,
    emailAddress: string,
    phoneNumber: number,
  }
  partyDetails: {
    partySize: number,
    regionPreference: string,
    numberOfChildren: number,
    hasSmokers: boolean,
    hasBirthday: boolean,
    birthdayPersonName?: string
  }
}