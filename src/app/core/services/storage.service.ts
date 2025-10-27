// src/app/core/services/storage.service.ts

import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserResponse } from '../models';
import { JwtHelperService } from './jwt-helper.service';

/**
 * Service de gestion du stockage local (localStorage)
 * Gère le token JWT et les informations utilisateur
 * Compatible SSR (Server-Side Rendering)
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  // Injection de PLATFORM_ID pour détecter si on est dans le navigateur
  private platformId = inject(PLATFORM_ID);
  private jwtHelper = inject(JwtHelperService);
  private isBrowser: boolean;

  // Clés de stockage (constantes pour éviter les erreurs de frappe)
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    // Vérifier si on est dans un navigateur
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ==================== GESTION DU TOKEN ====================

  /**
   * Sauvegarder le token JWT
   */
  saveToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Récupérer le token JWT (vérifie l'expiration)
   * Retourne null si le token est expiré
   */
  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const token = localStorage.getItem(this.TOKEN_KEY);

    if (!token) {
      return null;
    }

    //  Vérifier si le token est expiré
    if (this.jwtHelper.isTokenExpired(token)) {
      console.warn('⏰ Token expiré détecté, nettoyage automatique');
      this.clear(); // Nettoyer automatiquement
      return null;
    }

    return token;
  }

  /**
   * Récupérer le token brut sans vérification (pour les cas spéciaux)
   */
  getRawToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Supprimer le token JWT
   */
  removeToken(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Vérifier si un token existe ET est valide
   */
  hasValidToken(): boolean {
    return this.getToken() !== null;
  }

  /**
   * Vérifier si un token existe (sans vérifier l'expiration)
   */
  hasToken(): boolean {
    return this.getRawToken() !== null;
  }

  // ==================== GESTION DE L'UTILISATEUR ====================

  /**
   * Sauvegarder les informations de l'utilisateur connecté
   */
  saveUser(user: UserResponse): void {
    if (this.isBrowser) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  getUser(): UserResponse | null {
    if (this.isBrowser) {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  /**
   * Supprimer les informations de l'utilisateur
   */
  removeUser(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  // ==================== NETTOYAGE ====================

  /**
   * Tout supprimer (déconnexion complète)
   */
  clear(): void {
    this.removeToken();
    this.removeUser();
  }

  // ==================== UTILITAIRES ====================

  /**
   * Vérifier si l'utilisateur est connecté avec un token valide
   */
  isLoggedIn(): boolean {
    return this.hasValidToken() && this.getUser() !== null;
  }

  /**
   * Obtenir les rôles de l'utilisateur connecté
   */
  getUserRoles(): string[] {
    const user = this.getUser();
    return user?.roles || [];
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.getUserRoles().includes(role);
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Vérifier si l'utilisateur est client
   */
  isClient(): boolean {
    return this.hasRole('CLIENT');
  }

  /**
   * Vérifier si l'utilisateur est employé
   */
  isEmploye(): boolean {
    return this.hasRole('EMPLOYE');
  }

  // ==================== INFORMATIONS TOKEN ====================

  /**
   * Obtenir la date d'expiration du token
   */
  getTokenExpirationDate(): Date | null {
    const token = this.getRawToken();
    return token ? this.jwtHelper.getTokenExpirationDate(token) : null;
  }

  /**
   * Obtenir le temps restant avant expiration (en millisecondes)
   */
  getTimeUntilExpiration(): number {
    const token = this.getRawToken();
    return token ? this.jwtHelper.getTimeUntilExpiration(token) : 0;
  }

  /**
   * Obtenir le username depuis le token
   */
  getUsernameFromToken(): string | null {
    const token = this.getRawToken();
    return token ? this.jwtHelper.getUsername(token) : null;
  }
}
