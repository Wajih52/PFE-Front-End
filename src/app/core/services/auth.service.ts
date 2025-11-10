// src/app/core/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, BehaviorSubject, tap, switchMap, map} from 'rxjs';
import {
  AuthRequest,
  AuthResponse,
  UserRegistration,
  PasswordResetRequest,
  PasswordReset,
  UserResponse
} from '../models';
import { StorageService } from './storage.service';
import { TokenMonitorService } from './token-monitor.service';

/**
 * Service d'authentification
 * Gère toutes les opérations liées à l'authentification
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private tokenMonitor = inject(TokenMonitorService);

  private readonly API_URL = 'http://localhost:8080';
  private readonly AUTH_URL = `${this.API_URL}/auth`;
  private readonly INSCRIPTION_URL = `${this.API_URL}/inscriptions`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.storage.isLoggedIn());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // BehaviorSubject pour l'utilisateur actuel
  private currentUserSubject = new BehaviorSubject<any>(this.storage.getUser());
  public currentUser$ = this.currentUserSubject.asObservable();


  // ==================== INSCRIPTION ====================

  /**
   * Inscription d'un nouvel utilisateur
   * POST /inscriptions/inscrire
   */
  register(data: UserRegistration): Observable<any> {
    return this.http.post(`${this.INSCRIPTION_URL}/inscrire`, data);
  }

  /**
   * Activation du compte après inscription
   * GET /inscriptions/activation?token=xxx
   */
  activateAccount(token: string): Observable<any> {
    return this.http.get(`${this.INSCRIPTION_URL}/activation`, {
      params: { token }
    });
  }

  // ==================== CONNEXION ====================

  /**
   * Connexion d'un utilisateur
   * POST /auth/login
   *
   * ⚠️ IMPORTANT : Cette méthode retourne un Observable qui ne se termine
   * que lorsque l'utilisateur est complètement chargé.
   * Ne redirigez qu'après que cet Observable soit complete !
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.AUTH_URL}/login`, credentials).pipe(
      switchMap((response: any) => {
        console.log('🔍 Réponse backend login:', response);

        // Stocker le token
        this.storage.saveToken(response.token);

        // ✅ Émettre seulement isAuthenticated (pas currentUser encore)
        this.isAuthenticatedSubject.next(true);

        // ✅ Charger le profil utilisateur
        return this.loadCurrentUser().pipe(
          tap((user)=>{
            // ✅ APRÈS avoir chargé l'utilisateur, émettre le currentUser
            this.currentUserSubject.next(user);
            console.log('✅ CurrentUser émis:', user);
          }),
          map((user) => {
            // ✅ Ajouter requirePasswordChange au user
            return { ...user, requirePasswordChange: response.requirePasswordChange };
          })
        );
      })
    );
  }

  // ==================== DÉCONNEXION ====================

  /**
   * Déconnexion de l'utilisateur
   * POST /auth/logout avec le token dans le header
   */
  logout(): Observable<any> {
    // Appeler le backend pour blacklister le token
    return this.http.post(`${this.AUTH_URL}/logout`, {})
      .pipe(
        tap(() => {
          //  Arrêter la surveillance
          this.tokenMonitor.stopMonitoring();

          // Supprimer les données locales
          this.storage.clear();

          // Mettre à jour l'état de connexion
          this.isAuthenticatedSubject.next(false);
          this.currentUserSubject.next(null);
        })
      );
  }

  /**
   * Déconnexion locale sans appel backend (en cas d'erreur ou token expiré)
   */
  logoutLocal(): void {
    // Arrêter la surveillance
    this.tokenMonitor.stopMonitoring();

    // Supprimer les données locales
    this.storage.clear();

    // Mettre à jour l'état de connexion
    this.isAuthenticatedSubject.next(false);
  }

  // ==================== RÉCUPÉRATION UTILISATEUR ====================

  /**
   * Récupérer les informations de l'utilisateur connecté
   * GET /utilisateurs/me
   */
  loadCurrentUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/utilisateurs/me`)
      .pipe(
        tap(user => {
          // Sauvegarder les infos utilisateur
          this.storage.saveUser(user);
          console.log('✅ Utilisateur sauvegardé dans le storage');
        })
      );
  }

  /**
   * Obtenir l'utilisateur connecté depuis le storage
   */
  getCurrentUser(): UserResponse | null {
    return this.storage.getUser();
  }

  // ==================== RÉINITIALISATION MOT DE PASSE ====================

  /**
   * Demander la réinitialisation du mot de passe
   * POST /auth/forgot-password
   */
  requestPasswordReset(data: PasswordResetRequest): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/forgot-password`, data);
  }

  /**
   * Réinitialiser le mot de passe avec le token
   * POST /auth/reset-password
   */
  resetPassword(data: PasswordReset): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/reset-password`, data);
  }

  /**
   * Renvoyer l'email d'activation
   * POST /inscriptions/resend-activation
   */
  resendActivationEmail(email: string): Observable<any> {
    return this.http.post(`${this.INSCRIPTION_URL}/resend-activation`, null, {
      params: { email }
    });
  }

  // ==================== VÉRIFICATIONS ====================

  /**
   * Vérifier si l'utilisateur est connecté (avec token valide)
   */
  isLoggedIn(): boolean {
    return this.storage.isLoggedIn();
  }

  /**
   * Obtenir le token JWT
   */
  getToken(): string | null {
    return this.storage.getToken();
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.storage.hasRole(role);
  }

  /**
   * Obtenir les rôles de l'utilisateur
   */
  getUserRoles(): string[] {
    return this.storage.getUserRoles();
  }
}
