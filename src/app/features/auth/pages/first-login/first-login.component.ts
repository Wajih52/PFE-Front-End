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

    console.log('🔄 FirstLoginComponent: Starting 4-second countdown...');

    // Rediriger automatiquement vers change-password après 2 secondes
    setTimeout(() => {

      console.log('🔄 FirstLoginComponent: Timeout completed, attempting navigation...');


      this.router.navigate(['/auth/change-password']).then(success => {
        if (success) {

          console.log('✅ Navigation to /auth/change-password successful');

        } else {

          console.error('❌ Navigation to /auth/change-password failed');
          // Fallback: try alternative navigation
          this.router.navigate(['/auth/change-password'], {
            replaceUrl: true
          });
        }
      }).catch(error => {
        console.error('❌ Navigation error:', error);
      });

    }, 4000);
  }
}
