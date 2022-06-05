import { Component, OnInit } from '@angular/core';
import {Router,Event,NavigationStart} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  
  isCollapsed:boolean = true;


  toggleNavMenu = () => {
    this.isCollapsed = !this.isCollapsed
  }

  constructor( private router: Router) {
    // close the menu when navigatin to new route
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.isCollapsed = true;
      }
  });

   }

  ngOnInit(): void {
  }

}
