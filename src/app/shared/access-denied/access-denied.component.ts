// access-denied.component.ts
import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  standalone: true,
  imports: [],
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {

  constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

  navigateToRecalamtion() {
    this.router.navigate(['/reclamations/nouvelle-reclamation']);
  }
}
