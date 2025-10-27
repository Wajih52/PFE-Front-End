// src/app/core/interceptors/jwt.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

/**
 * Intercepteur JWT - Ajoute automatiquement le token à toutes les requêtes HTTP
 *
 * Fonctionnement :
 * 1. Intercepte chaque requête HTTP sortante
 * 2. Vérifie si un token existe
 * 3. Ajoute le header Authorization: Bearer <token>
 * 4. Laisse passer la requête
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  // Récupérer le token
  const token = storage.getToken();

  console.log('🔍 Intercepteur JWT - Token présent:', !!token);

  // Liste des URLs qui ne nécessitent PAS de token
  const excludedUrls = [
    '/login',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/inscriptions/inscrire',
    '/inscriptions/activation',
    '/inscriptions/resend-activation',
    '/oauth2/',
    '/uploads/'
  ];

  // Vérifier si l'URL actuelle est exclue
  const isExcluded = excludedUrls.some(url => req.url.includes(url));

  // Si pas de token OU URL exclue → laisser passer sans modification
  if (!token || isExcluded) {
    if (!token && !isExcluded) {
      console.warn('⚠️ Pas de token pour l\'URL protégée:', req.url);
    }
    return next(req);
  }

  console.log('✅ Ajout du token à la requête:', req.url);

  // Cloner la requête et ajouter le header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Continuer avec la requête modifiée
  return next(clonedRequest);
};
