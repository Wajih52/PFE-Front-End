// src/app/core/services/jwt-helper.service.ts

import { Injectable } from '@angular/core';

/**
 * Service utilitaire pour manipuler les tokens JWT
 * Adapté pour le backend Spring Boot avec JwtUtil.java
 *
 * Structure du JWT généré par Spring Boot :
 * {
 *   "sub": "username",     // Le username/email de l'utilisateur
 *   "iat": 1703001234,     // Issued At (date création en secondes)
 *   "exp": 1703087634      // Expiration (date expiration en secondes)
 * }
 */
@Injectable({
  providedIn: 'root'
})
export class JwtHelperService {

  /**
   * Décoder un token JWT sans vérification de signature
   * La signature est vérifiée côté Spring Boot uniquement
   */
  decodeToken(token: string): any {
    try {
      // Un JWT est composé de 3 parties : header.payload.signature
      const parts = token.split('.');

      if (parts.length !== 3) {
        console.error('❌ Token JWT invalide : format incorrect');
        return null;
      }

      // Décoder la partie payload (partie centrale)
      const payload = parts[1];
      const decodedPayload = this.base64UrlDecode(payload);

      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
      return null;
    }
  }

  /**
   * Vérifier si le token est expiré
   * @param token Le token JWT à vérifier
   * @returns true si expiré, false sinon
   */
  isTokenExpired(token: string | null): boolean {
    if (!token) {
      return true; // Pas de token = considéré comme expiré
    }

    const decoded = this.decodeToken(token);

    if (!decoded || !decoded.exp) {
      console.warn('⚠️ Token sans date d\'expiration');
      return true; // Token invalide = expiré
    }

    // exp est en SECONDES (standard JWT)
    // Date.now() est en MILLISECONDES
    const expirationDate = decoded.exp * 1000;
    const now = Date.now();

    // ✅ Marge de sécurité de 30 secondes pour éviter les problèmes de timing
    const bufferTime = 30000; // 30 secondes
    const isExpired = expirationDate < (now + bufferTime);

    if (isExpired) {
      const expirationDateFormatted = new Date(expirationDate).toLocaleString();
      console.warn(`⏰ Token expiré le ${expirationDateFormatted}`);
    } else {
      const timeRemaining = Math.floor((expirationDate - now) / 60000);
      console.debug(`✅ Token valide (expire dans ${timeRemaining} minutes)`);
    }

    return isExpired;
  }

  /**
   * Obtenir la date d'expiration du token
   * @returns Date d'expiration ou null si invalide
   */
  getTokenExpirationDate(token: string): Date | null {
    const decoded = this.decodeToken(token);

    if (!decoded || !decoded.exp) {
      return null;
    }

    // Convertir les secondes en millisecondes
    return new Date(decoded.exp * 1000);
  }

  /**
   * Obtenir la date de création du token
   * @returns Date de création ou null si invalide
   */
  getTokenIssuedAt(token: string): Date | null {
    const decoded = this.decodeToken(token);

    if (!decoded || !decoded.iat) {
      return null;
    }

    // Convertir les secondes en millisecondes
    return new Date(decoded.iat * 1000);
  }

  /**
   * Obtenir le temps restant avant expiration (en millisecondes)
   * @returns Millisecondes restantes, ou 0 si expiré/invalide
   */
  getTimeUntilExpiration(token: string): number {
    const expirationDate = this.getTokenExpirationDate(token);

    if (!expirationDate) {
      return 0;
    }

    const timeRemaining = expirationDate.getTime() - Date.now();
    return timeRemaining > 0 ? timeRemaining : 0;
  }

  /**
   * Extraire le username/identifiant du token (claim "sub")
   * Correspond au username utilisé dans Spring Boot
   *
   * @returns Le username ou null si invalide
   */
  getUsername(token: string): string | null {
    const decoded = this.decodeToken(token);

    // Le "sub" (subject) contient le username dans ton Spring Boot
    return decoded?.sub || null;
  }

  /**
   * ⚠️ NOTE IMPORTANTE : Les rôles ne sont PAS dans le JWT
   *
   * Ton Spring Boot ne stocke PAS les rôles dans le token.
   * Les rôles sont chargés depuis la base de données via CustomUserDetailsService.
   *
   * Pour obtenir les rôles, utilise StorageService.getUserRoles() qui lit
   * les rôles depuis localStorage (stockés après /utilisateurs/me).
   *
   * Cette méthode retourne toujours un tableau vide.
   */
  getRolesFromToken(token: string): string[] {
    // Ton JWT ne contient pas les rôles
    // Les rôles sont récupérés via l'endpoint /utilisateurs/me
    return [];
  }

  /**
   * Obtenir toutes les informations du token décodé
   * Utile pour le debug
   */
  getTokenInfo(token: string): TokenInfo | null {
    const decoded = this.decodeToken(token);

    if (!decoded) {
      return null;
    }

    const issuedAt = decoded.iat ? new Date(decoded.iat * 1000) : null;
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : null;
    const now = new Date();

    return {
      username: decoded.sub || 'N/A',
      issuedAt: issuedAt,
      expiresAt: expiresAt,
      isExpired: this.isTokenExpired(token),
      timeRemaining: this.getTimeUntilExpiration(token),
      raw: decoded
    };
  }

  /**
   * Vérifier si le token est valide (format et non expiré)
   * Ne vérifie PAS la signature (fait par Spring Boot)
   */
  isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }

    // Vérifier le format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Vérifier que le token peut être décodé
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return false;
    }

    // Vérifier qu'il n'est pas expiré
    return !this.isTokenExpired(token);
  }

  /**
   * Décoder une chaîne Base64URL (format JWT)
   * Base64URL est différent de Base64 standard :
   * - Remplace '+' par '-'
   * - Remplace '/' par '_'
   * - Pas de padding '='
   */
  private base64UrlDecode(str: string): string {
    try {
      // Remplacer les caractères Base64URL par Base64 standard
      let output = str.replace(/-/g, '+').replace(/_/g, '/');

      // Ajouter le padding si nécessaire
      switch (output.length % 4) {
        case 0:
          break;
        case 2:
          output += '==';
          break;
        case 3:
          output += '=';
          break;
        default:
          throw new Error('Chaîne Base64URL invalide');
      }

      // Décoder en utilisant atob (disponible dans le navigateur)
      const decoded = atob(output);

      // Gérer les caractères UTF-8
      return decodeURIComponent(
        decoded
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch (error) {
      throw new Error('Erreur de décodage Base64URL: ' + error);
    }
  }
}

/**
 * Interface pour les informations du token
 */
export interface TokenInfo {
  username: string;
  issuedAt: Date | null;
  expiresAt: Date | null;
  isExpired: boolean;
  timeRemaining: number; // en millisecondes
  raw: any; // payload décodé complet
}
