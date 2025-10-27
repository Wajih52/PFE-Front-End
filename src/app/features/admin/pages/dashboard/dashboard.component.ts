// src/app/features/dashboard/dashboard.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';
import {ConfirmationService} from '../../../../core/services/confirmation.service';
import {MenuNavigationComponent} from '../menu-navigation/menu-navigation.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MenuNavigationComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private storage = inject(StorageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  // Informations utilisateur
  userName = '';
  userEmail = '';
  userCode = '';
  userRoles: string[] = [];
  userImage = '';
  userPhone = '';

  // États
  isLoggingOut = false;
  isLoading = true;

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Charger les données utilisateur
   */
  private loadUserData(): void {
    // Récupérer les informations de l'utilisateur connecté
    const user = this.storage.getUser();

    if (user) {
      // Charger les données utilisateur
      this.userName = `${user.prenom} ${user.nom}`;
      this.userEmail = user.email;
      this.userCode = user.codeUtilisateur;
      this.userRoles = user.roles || [];
      this.userImage = user.image ? `http://localhost:8080${user.image}` : '';
      this.userPhone = user.telephone?.toString() || '';
      this.isLoading = false;

      console.log('✅ Utilisateur chargé dans le dashboard:', this.userName);
    } else {
      // Si pas d'utilisateur en localStorage, essayer de le recharger depuis l'API
      console.warn('⚠️ Aucun utilisateur en localStorage, tentative de rechargement...');

      this.authService.loadCurrentUser().subscribe({
        next: (userData) => {
          console.log('✅ Utilisateur rechargé depuis l\'API');
          this.loadUserData(); // Recharger après avoir récupéré l'utilisateur
        },
        error: (error) => {
          console.error('❌ Impossible de charger l\'utilisateur', error);

          // Rediriger vers login
          this.router.navigate(['/auth/login'], {
            queryParams: { expired: 'true' }
          });
        }
      });
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    const confirmed = await this.confirmationService.confirm({
      title: '👋 Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      confirmText: 'Oui, me déconnecter',
      type: 'info'
    });
    if(!confirmed) return ;
    if (confirmed) {
      this.isLoggingOut = true;

      this.authService.logout().subscribe({
        next: () => {
          console.log('✅ Déconnexion réussie');
          this.router.navigate(['/auth/login'], {
            queryParams: { logout: 'true' }
          });
        },
        error: (error) => {
          console.error('❌ Erreur de déconnexion', error);
          // Déconnecter quand même côté client
          this.storage.clear();
          this.router.navigate(['/auth/login']);
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
    }
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.userRoles.includes(role);
  }

  /**
   * Obtenir les initiales de l'utilisateur (pour l'avatar)
   */
  getUserInitials(): string {
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0) + names[1].charAt(0);
    }
    return names[0].charAt(0) || '?';
  }
}
