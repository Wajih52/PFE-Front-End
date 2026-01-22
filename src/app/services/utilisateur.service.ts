// src/app/services/utilisateur.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import {StatutCompte, UserPatchRequest, UserRequest, UserResponse} from '../core/models';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private readonly API_URL = `${variables.apiUrl}/utilisateurs`;

  // ============================================
  // RÉCUPÉRATION DES UTILISATEURS
  // ============================================

  /**
   * Récupérer tous les utilisateurs
   */
  getAllUtilisateurs(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(`${this.API_URL}/all`);
  }

  /**
   * Récupérer un utilisateur par son ID
   */
  getUtilisateurById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  getMonProfil(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.API_URL}/me`);
  }

  // ============================================
  // CRÉATION ET MODIFICATION
  // ============================================

  /**
   * Ajouter un nouvel utilisateur
   */
  ajouterUtilisateur(utilisateur: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/ajouter`, utilisateur);
  }

  /**
   * Modifier complètement un utilisateur (PUT)
   */
  modifierUtilisateur(id: number, utilisateur: UserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`${this.API_URL}/modifier/${id}`, utilisateur);
  }

  /**
   * Modifier partiellement un utilisateur (PATCH)
   */
  modifierUtilisateurPartiel(id: number, modifications: UserPatchRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.API_URL}/modifierPartiel/${id}`, modifications);
  }

  // ============================================
  // GESTION DU COMPTE
  // ============================================

  /**
   * Verrouiller un compte
   */
  suspendAccount(id: number): Observable<UserResponse> {
    return this.http.patch<UserResponse>(`${this.API_URL}/${id}/suspendre`, {});
  }

  /**
   * Activer un compte
   */
  EnableAccount(id: number): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/${id}/activer`, {});
  }

  /**
   *  Désactiver un compte
   */
  desactiverAccount(id: number): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/${id}/desactiver`, {});
  }

  /**
   *  archiver un compte
   */
  archiverAccount(id: number): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.API_URL}/${id}/archiver`, {});
  }

  // ============================================
  // SUPPRESSION
  // ============================================

  /**
   * Supprimer un utilisateur
   */
  supprimerUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }


  // ============================================
  // MÉTHODES SPÉCIFIQUES POUR LIVRAISONS
  // ============================================

  /**
   * Obtenir tous les employés (ADMIN, MANAGER, EMPLOYE) actifs
   * Utile pour les affectations de livraisons
   *
   */
  getAllEmployes(): Observable<UserResponse[]> {
    return new Observable(observer => {
      this.getAllUtilisateurs().subscribe({
        next: (users) => {
          // FILTRAGE
          const employes = users.filter(user => {
            // Vérifier que le compte est actif
            const isActif = user.etatCompte === StatutCompte.ACTIVE;

            // Vérifier que l'utilisateur a au moins un rôle employé/manager/admin
            const hasEmployeRole = user.roles.some(role =>
              role === 'EMPLOYE' ||
              role === 'MANAGER' ||
              role === 'ADMIN'
            );

            return isActif && hasEmployeRole;
          });

          observer.next(employes);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  /**
   * Obtenir seulement les employés (pas les admins/managers)
   */
  getEmployesOnly(): Observable<UserResponse[]> {
    return new Observable(observer => {
      this.getAllUtilisateurs().subscribe({
        next: (users) => {
          const employes = users.filter(user =>
            user.etatCompte === StatutCompte.ACTIVE &&
            user.roles.includes('EMPLOYE')
          );

          observer.next(employes);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /**
   * Obtenir seulement les clients actifs
   */
  getClientsActifs(): Observable<UserResponse[]> {
    return new Observable(observer => {
      this.getAllUtilisateurs().subscribe({
        next: (users) => {
          const clients = users.filter(user =>
            user.etatCompte === StatutCompte.ACTIVE &&
            user.roles.includes('CLIENT')
          );

          observer.next(clients);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

}
