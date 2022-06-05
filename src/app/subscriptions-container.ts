import { Subscription } from "rxjs"; 

export class SubscriptionsContainer {
  private subs:any | Subscription = [];

  // add all subscriptions here
  set add(subscription: Subscription) {
    this.subs.push(subscription);
  }
  // unsubscribe from all at once
  unsubscribe(){
    this.subs.forEach((sub:any) => sub.unsubscribe())
  }
}