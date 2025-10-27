// src/app/core/services/token-monitor.service.ts

import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { StorageService } from './storage.service';
import { JwtHelperService } from './jwt-helper.service';

/**
 * Service de surveillance du token JWT
 * Vérifie périodiquement l'expiration et déconnecte automatiquement
 *
 * À activer dans app.component.ts au démarrage de l'application
 */
@Injectable({
  providedIn: 'root'
})
export class TokenMonitorService {
  private storage = inject(StorageService);
  private jwtHelper = inject(JwtHelperService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private monitorSubscription?: Subscription;
  private warningShown = false;

  // Vérifier toutes les 60 secondes
  private readonly CHECK_INTERVAL = 60 * 1000; // 60 secondes

  // Afficher un warning 5 minutes avant expiration (optionnel)
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  /**
   * Démarrer la surveillance du token
   */
  startMonitoring(): void {
    // Uniquement côté client
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Arrêter une surveillance existante
    this.stopMonitoring();

    console.log('🔍 Démarrage de la surveillance du token');

    // Vérifier immédiatement
    this.checkToken();

    // Puis vérifier toutes les X secondes
    this.monitorSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkToken();
    });
  }

  /**
   * Arrêter la surveillance
   */
  stopMonitoring(): void {
    if (this.monitorSubscription) {
      this.monitorSubscription.unsubscribe();
      console.log('🛑 Arrêt de la surveillance du token');
    }
    this.warningShown = false;
  }

  /**
   * Vérifier l'état du token
   */
  private checkToken(): void {
    const token = this.storage.getRawToken();

    // Pas de token = rien à vérifier
    if (!token) {
      return;
    }

    // Vérifier si le token est expiré
    if (this.jwtHelper.isTokenExpired(token)) {
      console.warn('⏰ Token expiré détecté par la surveillance');
      this.handleTokenExpired();
      return;
    }

    // Optionnel : Avertir l'utilisateur si le token expire bientôt
    const timeUntilExpiration = this.jwtHelper.getTimeUntilExpiration(token);

    if (timeUntilExpiration < this.WARNING_THRESHOLD && !this.warningShown) {
      this.showExpirationWarning(timeUntilExpiration);
    }
  }

  /**
   * Gérer l'expiration du token
   */
  private handleTokenExpired(): void {
    // Arrêter la surveillance
    this.stopMonitoring();

    // Nettoyer le storage
    this.storage.clear();

    // Rediriger vers login
    this.router.navigate(['/auth/login'], {
      queryParams: { expired: 'true' }
    });
  }

  /**
   * Afficher un avertissement d'expiration imminente (optionnel)
   */
  private showExpirationWarning(timeRemaining: number): void {
    this.warningShown = true;

    const minutesRemaining = Math.floor(timeRemaining / 60000);

    console.warn(`⚠️ Votre session expire dans ${minutesRemaining} minute(s)`);

  }
}
