// src/app/features/auth/pages/oauth2-redirect/oauth2-redirect.component.ts

import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="oauth2-container">
      <div class="oauth2-card">
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <h2>Connexion avec Google en cours...</h2>
          <p>Veuillez patienter</p>
        </div>

        <div *ngIf="errorMessage" class="error">
          <h2>❌ Erreur de connexion</h2>
          <p>{{ errorMessage }}</p>
          <button (click)="goToLogin()">Retour à la connexion</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .oauth2-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .oauth2-card {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 400px;
    }

    .loading h2 {
      margin-top: 20px;
      color: #333;
    }

    .loading p {
      color: #666;
      margin-top: 8px;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #333;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error h2 {
      color: #c33;
      margin-bottom: 12px;
    }

    .error p {
      color: #666;
      margin-bottom: 20px;
    }

    .error button {
      padding: 12px 24px;
      background-color: #000;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .error button:hover {
      background-color: #333;
    }
  `]
})
export class OAuth2RedirectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage = inject(StorageService);
  private authService = inject(AuthService);

  // ✅ AJOUTÉ : Détecter si on est dans le navigateur
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  isLoading = true;
  errorMessage = '';

  constructor() {
    // ✅ Vérifier si on est dans le navigateur
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // ✅ MODIFIÉ : N'exécuter que côté client
    if (!this.isBrowser) {
      return; // Ne rien faire côté serveur
    }

    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        // Cas d'erreur
        this.isLoading = false;
        this.errorMessage = error;
        console.error('❌ Erreur OAuth2:', error);
        return;
      }

      if (token) {
        // Cas de succès
        this.handleSuccessfulAuth(token);
      } else {
        // Pas de token ni d'erreur
        this.isLoading = false;
        this.errorMessage = 'Token manquant. Veuillez réessayer.';
      }
    });
  }

  /**
   * Gérer l'authentification réussie
   */
  private handleSuccessfulAuth(token: string): void {
    console.log('✅ Token OAuth2 reçu');

    // ✅ Sauvegarder le token (SYNCHRONE - pas besoin d'attendre)
    this.storage.saveToken(token);

    // ✅ Démarrer la surveillance du token
    // Note: On pourrait aussi laisser app.component.ts le faire,
    // mais c'est mieux de le faire ici pour être cohérent avec login()

    // ✅ Charger les informations utilisateur IMMÉDIATEMENT
    // Pas besoin de setTimeout car localStorage est synchrone
    this.authService.loadCurrentUser().subscribe({
      next: (user) => {
        console.log('✅ Utilisateur OAuth2 chargé:', user);

        // Rediriger vers le dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de l\'utilisateur OAuth2:', error);
        this.isLoading = false;

        // Message d'erreur selon le type
        if (error.status === 401) {
          this.errorMessage = 'Token invalide. Veuillez vous reconnecter.';
        } else {
          this.errorMessage = 'Impossible de charger les informations utilisateur';
        }
      }
    });
  }

  /**
   * Retour à la page de connexion
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
