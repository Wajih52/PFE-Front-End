import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-menu-navigation',
  standalone :true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './menu-navigation.component.html',
  styleUrl: './menu-navigation.component.scss'
})
export class MenuNavigationComponent {

}
