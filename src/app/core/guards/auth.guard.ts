// src/app/core/guards/auth.guard.ts

import {inject} from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { JwtHelperService } from '../services/jwt-helper.service';


/**
 * Guard 1 : Vérifier l'authentification
 * Protège les routes qui nécessitent une authentification
 * Vérifie que l'utilisateur est connecté ET que son token n'est pas expiré
 *
 * Utilisation :
 * { path: 'dashboard', canActivate: [authGuard], component: DashboardComponent }
 */
export const authGuard: CanActivateFn = (route, state) => {



  const storage = inject(StorageService);
  const jwtHelper = inject(JwtHelperService);
  const router = inject(Router);

  const token = storage.getRawToken();

  // CAS 1 : Pas de token
  if (!token) {
   // console.warn('🔒 Accès refusé : Pas de token');
    router.navigate(['/loading'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // CAS 2 : Token expiré
  if (jwtHelper.isTokenExpired(token)) {
    console.warn('⏰ Accès refusé : Token expiré');

    // Nettoyer le storage
    storage.clear();

    // Rediriger vers login avec message
    router.navigate(['/auth/login'], {
      queryParams: {
        returnUrl: state.url,
        expired: 'true'
      }
    });
    return false;
  }

  // CAS 3 : Token valide
  console.log('✅ Token valide, accès autorisé');
  return true;
};

/**
 * Guard 2 : Vérifier les rôles
 * Protège les routes qui nécessitent des rôles spécifiques
 *
 * ⚠️ IMPORTANT : Utiliser APRÈS authGuard pour garantir que l'utilisateur est connecté
 *
 * Utilisation :
 * {
 *   path: 'admin',
 *   canActivate: [authGuard, roleGuard(['ADMIN'])],
 *   component: AdminComponent
 * }
 *
 * {
 *   path: 'client',
 *   canActivate: [authGuard, roleGuard(['CLIENT', 'ADMIN'])], // CLIENT OU ADMIN
 *   component: ClientComponent
 * }
 *
 * @param allowedRoles Liste des rôles autorisés (un seul suffit)
 * @returns CanActivateFn
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const storage = inject(StorageService);
    const router = inject(Router);

    // Récupérer les rôles de l'utilisateur depuis localStorage
    const userRoles = storage.getUserRoles();

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      console.warn(`⛔ Accès refusé : Rôle insuffisant`);
      console.warn(`   Rôles requis: ${allowedRoles.join(', ')}`);
      console.warn(`   Rôles utilisateur: ${userRoles.join(', ')}`);

      // Rediriger vers une page d'accès refusé
      router.navigate(['/access-denied']);
      return false;
    }

    console.log(`✅ Rôle valide (${allowedRoles.join(' ou ')}), accès autorisé`);
    return true;
  };
};
