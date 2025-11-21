// src/app/services/livraison.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { variables } from '../core/environement/variables';
import {
  LivraisonRequestDto,
  LivraisonResponseDto,
  AffectationLivraisonRequestDto,
  AffectationLivraisonDto
} from '../core/models/livraison.model';
import { StatutLivraison } from '../core/models/reservation.model';

/**
 * Service pour gérer les livraisons
 * Sprint 6 - Gestion des livraisons
 */
@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private apiUrl = `${variables.apiUrl}/api/livraisons`;

  constructor(private http: HttpClient) {}

  // ============================================
  // CRUD LIVRAISONS
  // ============================================

  /**
   * Créer une nouvelle livraison
   */
  creerLivraison(livraison: LivraisonRequestDto): Observable<LivraisonResponseDto> {
    return this.http.post<LivraisonResponseDto>(this.apiUrl, livraison);
  }

  /**
   * Modifier une livraison existante
   */
  modifierLivraison(id: number, livraison: LivraisonRequestDto): Observable<LivraisonResponseDto> {
    return this.http.put<LivraisonResponseDto>(`${this.apiUrl}/${id}`, livraison);
  }

  /**
   * Récupérer une livraison par ID
   */
  getLivraisonById(id: number): Observable<LivraisonResponseDto> {
    return this.http.get<LivraisonResponseDto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Récupérer toutes les livraisons
   */
  getAllLivraisons(): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(this.apiUrl);
  }

  /**
   * Récupérer les livraisons par statut
   */
  getLivraisonsByStatut(statut: StatutLivraison): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * Récupérer les livraisons d'une date spécifique
   */
  getLivraisonsByDate(date: string): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/date/${date}`);
  }

  /**
   * Récupérer les livraisons entre deux dates
   */
  getLivraisonsBetweenDates(dateDebut: string, dateFin: string): Observable<LivraisonResponseDto[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);

    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/periode`, { params });
  }

  /**
   * Récupérer les livraisons d'aujourd'hui
   */
  getLivraisonsAujourdhui(): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/aujourd-hui`);
  }

  /**
   * Récupérer les livraisons d'un employé
   */
  getLivraisonsByEmploye(idEmploye: number): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/employe/${idEmploye}`);
  }

  /**
   * Récupérer les livraisons d'une réservation
   */
  getLivraisonsByReservation(idReservation: number): Observable<LivraisonResponseDto[]> {
    return this.http.get<LivraisonResponseDto[]>(`${this.apiUrl}/reservation/${idReservation}`);
  }

  /**
   * Supprimer une livraison
   */
  supprimerLivraison(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ============================================
  // GESTION DES STATUTS
  // ============================================

  /**
   * Changer le statut d'une livraison
   */
  changerStatutLivraison(id: number, nouveauStatut: StatutLivraison): Observable<LivraisonResponseDto> {
    const params = new HttpParams().set('nouveauStatut', nouveauStatut);
    return this.http.patch<LivraisonResponseDto>(`${this.apiUrl}/${id}/statut`, null, { params });
  }

  /**
   * Marquer une livraison comme "En cours"
   */
  marquerEnCours(id: number): Observable<LivraisonResponseDto> {
    return this.http.patch<LivraisonResponseDto>(`${this.apiUrl}/${id}/en-cours`, null);
  }

  /**
   * Marquer une livraison comme "Livrée"
   */
  marquerLivree(id: number): Observable<LivraisonResponseDto> {
    return this.http.patch<LivraisonResponseDto>(`${this.apiUrl}/${id}/livree`, null);
  }

  // ============================================
  // AFFECTATION D'EMPLOYÉS
  // ============================================

  /**
   * Affecter un employé à une livraison
   */
  affecterEmploye(affectation: AffectationLivraisonRequestDto): Observable<AffectationLivraisonDto> {
    return this.http.post<AffectationLivraisonDto>(`${this.apiUrl}/affectations`, affectation);
  }

  /**
   * Retirer un employé d'une livraison
   */
  retirerEmploye(idAffectation: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/affectations/${idAffectation}`);
  }

  /**
   * Récupérer les affectations d'une livraison
   */
  getAffectationsByLivraison(idLivraison: number): Observable<AffectationLivraisonDto[]> {
    return this.http.get<AffectationLivraisonDto[]>(`${this.apiUrl}/${idLivraison}/affectations`);
  }

  /**
   * Récupérer les affectations d'un employé
   */
  getAffectationsByEmploye(idEmploye: number): Observable<AffectationLivraisonDto[]> {
    return this.http.get<AffectationLivraisonDto[]>(`${this.apiUrl}/affectations/employe/${idEmploye}`);
  }

  // ============================================
  // BON DE LIVRAISON
  // ============================================

  /**
   * Télécharger le bon de livraison (PDF)
   */
  telechargerBonLivraison(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/bon-livraison`, {
      responseType: 'blob'
    });
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  /**
   * Compter les livraisons par statut
   */
  countByStatut(statut: StatutLivraison): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/statistiques/statut/${statut}`);
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Formatter la date pour l'API (YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Formatter l'heure pour l'API (HH:mm:ss)
   */
  formatTimeForApi(time: string): string {
    // Si le format est déjà HH:mm:ss, le retourner tel quel
    if (time.split(':').length === 3) {
      return time;
    }
    // Sinon, ajouter les secondes
    return `${time}:00`;
  }

  /**
   * Télécharger le PDF du bon de livraison
   */
  downloadBonLivraison(id: number, titreLivraison: string): void {
    this.telechargerBonLivraison(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bon-livraison-${titreLivraison.replace(/\s+/g, '-')}-${id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du bon de livraison:', error);
      }
    });
  }
}
