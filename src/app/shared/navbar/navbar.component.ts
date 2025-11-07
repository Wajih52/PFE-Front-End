// navbar.component.ts
import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { PanierService } from '../../services/panier.service';
import { AuthService } from '../../core/services/auth.service';
import {StorageService} from '../../core/services/storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit{
  private panierService = inject(PanierService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private storage = inject(StorageService);
  totalPanier = this.panierService.totalArticles;

  isAuthenticated = false;
  userName: string | null = null;


  /**
   * Vérifie si l'utilisateur est connecté
   */
  private checkAuthentication(): void {
    const token = this.storage.getToken();
    this.isAuthenticated = !!token;

    if (this.isAuthenticated) {
      this.userName = this.storage.getUserName();
    }
  }


  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  ngOnInit(): void {
    this.checkAuthentication();
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
    this.storage.clear();
    this.isAuthenticated = false;
    this.userName = null;
    this.router.navigate(['/auth/login']);
  }

  /**
   * Scroll vers une section spécifique
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

}
