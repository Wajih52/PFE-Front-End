// navbar.component.ts - VERSION CORRIGÉE SSR
import {Component, inject, OnInit, PLATFORM_ID, afterNextRender, signal} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { PanierService } from '../../services/panier.service';
import { AuthService } from '../../core/services/auth.service';
import {StorageService} from '../../core/services/storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{
  private authService = inject(AuthService);
  private router = inject(Router);
  private storage = inject(StorageService);
  private platformId = inject(PLATFORM_ID);

  // ✅ UTILISER des signals pour la réactivité
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<any>(null);



  // ✅ MODIFIÉ : Valeurs par défaut pour SSR
  userName: string | null = null;

  constructor() {
    // ✅ AJOUTÉ : Vérifier l'authentification UNIQUEMENT côté client après le rendu
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {

      });
    }
  }

  ngOnInit(): void {
    // ✅ CORRECTION: S'abonner aux changements d'authentification
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }



  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Navigation vers la page de connexion
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers la page d'inscription
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Navigation vers le catalogue
   */
  goToCatalogue(): void {
    this.router.navigate(['/catalogue']);
  }

  /**
   * Navigation vers le profil utilisateur
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.authService.logout();

    this.userName = null;
    this.router.navigate(['/auth/login']);
  }

  /**
   * Scroll vers une section spécifique
   */
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
