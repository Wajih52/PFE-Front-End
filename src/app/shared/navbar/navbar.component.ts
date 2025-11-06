// src/app/shared/components/navbar/navbar.component.ts

import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../core/services/storage.service';

interface MenuItem {
  label: string;
  path: string;
  icon?: string;
  roles?: string[]; // Rôles autorisés pour cet item
}

/**
 * Composant Navbar adaptatif selon le rôle utilisateur
 * Rôles: CLIENT, ADMIN, EMPLOYE, MANAGER
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private storageService = inject(StorageService);
  private router = inject(Router);

  // États
  isScrolled = false;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;

  // Données utilisateur
  isAuthenticated = false;
  currentUser: any = null;
  userRoles: string[] = []; // ✅ Plusieurs rôles possibles
  userAvatar: string = 'assets/images/default-avatar.png';

  // Menu items selon le rôle
  menuItems: MenuItem[] = [];

  // Tous les menus possibles
  private readonly MENU_CONFIG = {
    // Menu pour tous
    PUBLIC: [
      { label: 'Accueil', path: '/home', icon: '🏠' },
      { label: 'Catalogue', path: '/catalogue', icon: '📦' },
      { label: 'Nos Services', path: '/services', icon: '⚡' },
      { label: 'À propos', path: '/about', icon: 'ℹ️' },
      { label: 'Contact', path: '/contact', icon: '📞' }
    ],

    // Menu Client
    CLIENT: [
      { label: 'Accueil', path: '/home', icon: '🏠' },
      { label: 'Catalogue', path: '/catalogue', icon: '📦' },
      { label: 'Mes Réservations', path: '/client/reservations', icon: '📅' },
      { label: 'Mon Panier', path: '/client/panier', icon: '🛒' },
      { label: 'Mes Factures', path: '/client/factures', icon: '📄' },
      { label: 'Réclamations', path: '/client/reclamations', icon: '💬' }
    ],

    // Menu Employé
    EMPLOYE: [
      { label: 'Tableau de Bord', path: '/dashboard', icon: '📊' },
      { label: 'Réservations', path: '/admin/reservations', icon: '📅' },
      { label: 'Livraisons', path: '/admin/livraisons', icon: '🚚' },
      { label: 'Retours', path: '/admin/retours', icon: '↩️' },
      { label: 'Produits', path: '/admin/produits', icon: '📦' },
      { label: 'Stock', path: '/admin/stock', icon: '📊' }
    ],

    // Menu Manager
    MANAGER: [
      { label: 'Tableau de Bord', path: '/dashboard', icon: '📊' },
      { label: 'Réservations', path: '/admin/reservations', icon: '📅' },
      { label: 'Produits', path: '/admin/produits', icon: '📦' },
      { label: 'Statistiques', path: '/manager/stats', icon: '📈' },
      { label: 'Rapports', path: '/manager/reports', icon: '📋' },
      { label: 'Équipe', path: '/manager/team', icon: '👥' }
    ],

    // Menu Admin
    ADMIN: [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Utilisateurs', path: '/admin/users', icon: '👥' },
      { label: 'Produits', path: '/admin/produits', icon: '📦' },
      { label: 'Réservations', path: '/admin/reservations', icon: '📅' },
      { label: 'Paiements', path: '/admin/paiements', icon: '💳' },
      { label: 'Livraisons', path: '/admin/livraisons', icon: '🚚' },
      { label: 'Réclamations', path: '/admin/reclamations', icon: '💬' },
      { label: 'Paramètres', path: '/admin/settings', icon: '⚙️' }
    ]
  };

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadUserData();
    this.updateMenu();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen = false;
    }
  }

  /**
   * Vérifier le statut d'authentification
   */
  checkAuthStatus(): void {
    const token = this.storageService.getToken();
    this.isAuthenticated = !!token;
  }

  /**
   * Charger les données utilisateur
   */
  loadUserData(): void {
    if (this.isAuthenticated) {
      this.currentUser = this.storageService.getUser();
      this.userRoles = this.storageService.getUserRoles(); // ✅ Récupérer tous les rôles

      // Charger l'avatar si disponible
      if (this.currentUser?.image) {
        this.userAvatar = `http://localhost:8080${this.currentUser.image}`;
      }
    }
  }

  /**
   * Mettre à jour le menu selon les rôles
   * Priorité: ADMIN > MANAGER > EMPLOYE > CLIENT
   */
  updateMenu(): void {
    if (!this.isAuthenticated) {
      this.menuItems = this.MENU_CONFIG.PUBLIC;
      return;
    }

    // Convertir tous les rôles en majuscules pour comparaison
    const rolesUpper = this.userRoles.map(r => r.toUpperCase());

    // Vérifier dans l'ordre de priorité
    if (rolesUpper.includes('ADMIN')) {
      this.menuItems = this.MENU_CONFIG.ADMIN;
    } else if (rolesUpper.includes('MANAGER')) {
      this.menuItems = this.MENU_CONFIG.MANAGER;
    } else if (rolesUpper.includes('EMPLOYE') || rolesUpper.includes('EMPLOYEE')) {
      this.menuItems = this.MENU_CONFIG.EMPLOYE;
    } else if (rolesUpper.includes('CLIENT')) {
      this.menuItems = this.MENU_CONFIG.CLIENT;
    } else {
      // Par défaut, menu CLIENT
      this.menuItems = this.MENU_CONFIG.CLIENT;
    }
  }

  /**
   * Toggle menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * Toggle menu utilisateur
   */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  /**
   * Fermer le menu mobile après navigation
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  /**
   * Navigation vers le profil
   */
  goToProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  /**
   * Navigation vers les paramètres
   */
  goToSettings(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/settings']);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    this.isUserMenuOpen = false;
    this.storageService.clear();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.userRoles = []; // ✅ Réinitialiser les rôles
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Navigation vers register
   */
  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  /**
   * Obtenir le nom d'affichage
   */
  getDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.pseudo ||
        `${this.currentUser.prenom} ${this.currentUser.nom}` ||
        this.currentUser.email;
    }
    return 'Utilisateur';
  }

  /**
   * Obtenir le badge du rôle principal
   * Si plusieurs rôles, affiche le plus important (ADMIN > MANAGER > EMPLOYE > CLIENT)
   */
  getRoleBadge(): string {
    if (!this.userRoles || this.userRoles.length === 0) {
      return '👤';
    }

    const rolesUpper = this.userRoles.map(r => r.toUpperCase());

    // Ordre de priorité pour l'affichage
    if (rolesUpper.includes('ADMIN')) {
      return '👑 Admin';
    } else if (rolesUpper.includes('MANAGER')) {
      return '📊 Manager';
    } else if (rolesUpper.includes('EMPLOYE') || rolesUpper.includes('EMPLOYEE')) {
      return '👔 Employé';
    } else if (rolesUpper.includes('CLIENT')) {
      return '👤 Client';
    }

    return '👤';
  }
}
