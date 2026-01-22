// src/app/core/interceptors/error.interceptor.ts

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { TokenMonitorService } from '../services/token-monitor.service';
import {NotificationService} from '../../services/notification.service';

/**
 * Intercepteur de gestion des erreurs HTTP
 *
 * Gère automatiquement :
 * - 401 Unauthorized → Déconnexion et redirection vers login
 * - 403 Forbidden → Accès refusé
 * - 500 Internal Server Error → Erreur serveur
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);
  const tokenMonitor = inject(TokenMonitorService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      // 401 Unauthorized - Token invalide ou expiré
      if (error.status === 401) {

        // Vérifier si c'est une requête d'authentification
        const isAuthRequest = req.url.includes('/auth/login') ||
          req.url.includes('/auth/register') ||
          req.url.includes('/inscriptions');

        if (isAuthRequest) {
          //  Si c'est une tentative de connexion/inscription ratée
          // → On ne redirige PAS, on laisse le composant gérer l'erreur
          console.warn('Échec d\'authentification : identifiants incorrects');

        } else {
          //  Si c'est une requête authentifiée qui a échoué
          // → C'est un token expiré/invalide, on redirige
          console.error(' Erreur 401 : Token expiré ou invalide');

          // Arrêter la surveillance du token
          tokenMonitor.stopMonitoring();

          // Supprimer les données locales
          storage.clear();

          // Rediriger vers la page de connexion avec message d'expiration
          router.navigate(['/auth/login'], {
            queryParams: { expired: 'true' }
          });
        }
      }

      // 403 Forbidden - Pas les permissions nécessaires
      if (error.status === 403) {
        console.error('Erreur 403 : Accès interdit', error.error);

        //  Vérifier si c'est l'erreur de connexion Google avec compte classique
        const errorMessage = error.error?.message || '';
        if (errorMessage.includes('déjà utilisé avec une connexion classique') ||
          errorMessage.includes('Cet email est déjà utilisé')) {

          console.error(' Connexion Google refusée - Compte classique existant');
          router.navigate(['/auth/login'], {
            queryParams: {
              access: 'false',
              message: encodeURIComponent(errorMessage)
            }
          });
        } else {
          // Autres erreurs 403
          console.error('Erreur 403 : Permissions insuffisantes');
          router.navigate(['/access-denied']);
        }
      }

      // 500 Internal Server Error
      if (error.status === 500) {
        console.error('Erreur 500 : Erreur serveur', error.message);

      }

      // 0 - Pas de connexion au serveur
      if (error.status === 0) {
        console.error('Erreur réseau : Impossible de contacter le serveur');
      }

      // Propager l'erreur pour que le service puisse la gérer
      return throwError(() => error);
    })
  );
};
