import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReviewPageComponent } from './review-page/review-page.component';
import { HomeComponent } from './home/home.component';
import { ReservationComponent } from './reservation/reservation.component';

const routes: Routes = [
  { path: 'reservation', component: ReservationComponent },
  { path: 'review-page', component: ReviewPageComponent },
  { path: '', component: HomeComponent }
  // { path: '**', redirectTo: ''} 
  // { path: '**', component: PageNotFoundComponent },  // Wildcard route for a 404 page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
