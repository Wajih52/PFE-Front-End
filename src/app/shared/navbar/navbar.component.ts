// src/app/shared/navbar/navbar.component.ts

import {Component, OnInit, OnDestroy, inject, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PanierService } from '../../services/panier.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private panierService = inject(PanierService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // ✅ Observable pour la réactivité automatique
  isAuthenticated$ = this.authService.isAuthenticated$;
  currentUser$ = this.authService.currentUser$;

userName : string | null = null;

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // ✅ S'abonner aux changements d'authentification pour logger
    this.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuth => {
      this.userName = this.authService.getCurrentUser()?.pseudo ?? null ;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Naviguer vers le profil
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);

  }

  /**
   * Naviguer vers le dashboard (admin/employé)
   */
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);

  }

  /**
   * Naviguer vers le panier
   */
  goToCart(): void {
    this.router.navigate(['/panier']);
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

  /**
   * Naviguer vers le catalogue
   */
  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);

  }

  /**
   * Naviguer vers l'accueil
   */
  goToHome(): void {
    this.router.navigate(['/home']);

  }


  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Déconnexion réussie depuis navbar');
        this.router.navigate(['/auth/login'], {
          queryParams: { logout: 'true' }
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
      }
    });
  }

  scrollToSection(sectionId: string): void {
    // ✅ SÉCURISÉ : Vérifier que nous sommes côté client
    if (isPlatformBrowser(this.platformId)) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}
