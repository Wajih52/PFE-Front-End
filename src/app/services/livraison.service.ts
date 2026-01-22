// src/app/services/livraison.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {catchError, Observable} from 'rxjs';
import { variables } from '../core/environement/variables';
import {
  LivraisonRequestDto,
  LivraisonResponseDto,
  AffectationLivraisonRequestDto,
  AffectationLivraisonDto
} from '../core/models/livraison.model';
import {LigneReservationResponseDto, StatutLivraison} from '../core/models/reservation.model';


@Injectable({
  providedIn: 'root'
})
export class LivraisonService {
  private apiUrl = `${variables.apiUrl}/livraisons`;

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

  /**
   * Marquer une ligne de réservation comme livrée
   */
  marquerLigneLivree(idLigne: number): Observable<LigneReservationResponseDto> {
    return this.http.patch<LigneReservationResponseDto>(`${this.apiUrl}/lignes/${idLigne}/livree`, {})
  }

  /**
   * Obtenir les lignes d'une livraison
   */
  getLignesLivraison(idLivraison: number): Observable<LigneReservationResponseDto[]> {
    return this.http.get<LigneReservationResponseDto[]>(`${this.apiUrl}/${idLivraison}/lignes`)
  }

  //===========================================
  // Gestion Des retours
  //============================================

  /**
   * Marquer une ligne de réservation comme "En retour"
   */
  marquerLigneEnRetour(idLigne: number): Observable<LigneReservationResponseDto> {
    return this.http.patch<LigneReservationResponseDto>(
      `${this.apiUrl}/lignes/${idLigne}/en-retour`,
      {}
    );
  }

  /**
   * Marquer une ligne de réservation comme "Retournée" (complète)
   */
  marquerLigneRetournee(idLigne: number): Observable<LigneReservationResponseDto> {
    return this.http.patch<LigneReservationResponseDto>(
      `${this.apiUrl}/lignes/${idLigne}/retournee`,
      {}
    );
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
  // MÉTHODES UTILITAIRES
  // ============================================

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
