// src/app/features/auth/pages/first-login/first-login.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './first-login.component.html',
  styleUrl: './first-login.component.scss'
})
export class FirstLoginComponent implements OnInit {
  private router = inject(Router);

  ngOnInit(): void {

    // Rediriger automatiquement vers change-password après 4 secondes
    setTimeout(() => {

      this.router.navigate(['/auth/change-password']).then(success => {
        if (success) {

          console.log('redirection vers /auth/change-password terminé avec succées');

        } else {

          console.error('redirection vers /auth/change-password est echoué');
          // Fallback: try alternative navigation
          this.router.navigate(['/auth/change-password'], {
            replaceUrl: true
          });
        }
      }).catch(error => {
        console.error('Navigation error:', error);
      });

    }, 4000);
  }
}
