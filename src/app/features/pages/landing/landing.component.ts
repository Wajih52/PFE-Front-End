// src/app/features/pages/landing/landing.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../core/services/storage.service';

/**
 * Landing Component - Page d'accueil avec auto-redirection
 *
 * Fonctionnement :
 * - Si l'utilisateur est connecté (token valide) → Redirige vers /dashboard
 * - Si l'utilisateur n'est pas connecté → Redirige vers /auth/login
 *
 * Cette page évite le "flash" de la page login en vérifiant l'auth AVANT de charger les composants
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-container">
      <div class="content">
        <!-- Logo de l'agence -->
        <div class="logo">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

        <!-- Titre -->
        <h1>Elegant Hive</h1>

        <!-- Spinner de chargement -->
        <div class="spinner"></div>

        <!-- Message de chargement -->
        <p class="loading-text">{{ loadingMessage }}</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>&copy; 2025 Agence Événementielle. Tous droits réservés.</p>
      </div>
    </div>
  `,
  styles: [`
    .landing-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: 100vh;
      background: linear-gradient(135deg, #605639 0%, #a2994b 100%);
      color: white;
      padding: 2rem;
    }

    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      text-align: center;
    }

    .logo {
      animation: fadeIn 0.6s ease-out;
    }

    .logo svg {
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
      animation: fadeIn 0.8s ease-out;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-text {
      font-size: 1rem;
      opacity: 0.9;
      animation: pulse 2s ease-in-out infinite;
    }

    .footer {
      opacity: 0.8;
      font-size: 0.875rem;
      animation: fadeIn 1s ease-out;
    }

    .footer p {
      margin: 0;
    }

    /* Animations */
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 0.9;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Responsive */
    @media (max-width: 640px) {
      h1 {
        font-size: 2rem;
      }

      .landing-container {
        padding: 1rem;
      }
    }
  `]
})
export class LandingComponent implements OnInit {
  private router = inject(Router);
  private storage = inject(StorageService);

  loadingMessage = 'Vérification de votre session...';

  ngOnInit(): void {
     console.log('🚀 Landing Component chargé');

      // ⏱️ Petit délai pour éviter le flash (optionnel, ajustable)
      setTimeout(() => {
        this.checkAuthAndRedirect();
      }, 1000);  // 300ms = temps pour afficher l'animation
    }

    private checkAuthAndRedirect(): void {
      console.log('🔍 Vérification de l\'authentification...');

      // Récupérer le token (getToken vérifie déjà l'expiration)
      const token = this.storage.getToken();

      if (token) {
        // ✅ Utilisateur connecté avec token valide
        console.log('✅ Token valide trouvé, redirection vers dashboard');
        this.loadingMessage = 'Connexion réussie ! Redirection...';

        this.router.navigate(['/admin/dashboard']);

      } else {
        // ❌ Pas de token ou token expiré
     //   console.log('❌ Pas de token valide, redirection vers login');
        this.loadingMessage = 'Redirection vers la connexion...';

        this.router.navigate(['/auth/login']);
      }
    }
}
