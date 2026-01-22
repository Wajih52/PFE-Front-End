// src/app/shared/navbar/navbar.component.ts

import {Component, OnInit, OnDestroy, inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PanierService } from '../../services/panier.service';
import { Subject, takeUntil } from 'rxjs';
import {ProfileDropdownComponent} from './profile-dropdown/profile-dropdown.component';
import {NotificationPanelComponent} from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ProfileDropdownComponent, NgOptimizedImage, NotificationPanelComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private panierService = inject(PanierService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Observable pour la réactivité automatique
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;

userName : string | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // S'abonner aux changements d'authentification pour logger
    this.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.userName = user ? `${user.prenom} ${user.nom}` : 'Utilisateur';
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Naviguer vers la connexion
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);

  }

  /**
   * Naviguer vers l'inscription
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);

  }

  scrollToSection(sectionId: string): void {
    // Vérifier que nous sommes côté client
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
