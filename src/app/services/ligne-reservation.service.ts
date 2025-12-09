// src/app/services/ligne-reservation.service.ts


import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LigneReservationRequestDto,
  LigneReservationResponseDto
} from '../core/models/reservation.model';
import { InstanceProduitResponse } from '../core/models';

import{variables} from '../core/environement/variables';

/**
 * Service pour gérer les lignes de réservation (produits dans le panier)
 * API: /api/lignes-reservation
 */
@Injectable({
  providedIn: 'root'
})
export class LigneReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = `${variables.apiUrl}/lignes-reservation`;

  // ============================================
  // CRÉATION ET AJOUT
  // ============================================

  /**
   * 🛒 Ajouter une ligne à une réservation
   * POST /api/lignes-reservation/{idReservation}
   * @requires ROLE: CLIENT, ADMIN, MANAGER
   */
  ajouterLigneReservation(
    idReservation: number,
    ligne: LigneReservationRequestDto
  ): Observable<LigneReservationResponseDto> {
    return this.http.post<LigneReservationResponseDto>(
      `${this.API_URL}/${idReservation}`,
      ligne
    );
  }

  // ============================================
  // CONSULTATION
  // ============================================

  /**
   * 📋 Récupérer une ligne par son ID
   * GET /api/lignes-reservation/{id}
   */
  getLigneById(id: number): Observable<LigneReservationResponseDto> {
    return this.http.get<LigneReservationResponseDto>(`${this.API_URL}/${id}`);
  }

  /**
   * 📋 Récupérer toutes les lignes d'une réservation
   * GET /api/lignes-reservation/reservation/{idReservation}
   */
  getLignesByReservation(idReservation: number): Observable<LigneReservationResponseDto[]> {
    return this.http.get<LigneReservationResponseDto[]>(
      `${this.API_URL}/reservation/${idReservation}`
    );
  }

  /**
   * 📋 Récupérer les lignes contenant un produit
   * GET /api/lignes-reservation/produit/{idProduit}
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  getLignesByProduit(idProduit: number): Observable<LigneReservationResponseDto[]> {
    return this.http.get<LigneReservationResponseDto[]>(
      `${this.API_URL}/produit/${idProduit}`
    );
  }

  /**
   * 📋 Récupérer les lignes par statut de livraison
   * GET /api/lignes-reservation/statut/{statut}
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  getLignesByStatut(statut: string): Observable<LigneReservationResponseDto[]> {
    return this.http.get<LigneReservationResponseDto[]>(
      `${this.API_URL}/statut/${statut}`
    );
  }

  // ============================================
  // MODIFICATION
  // ============================================

  /**
   *  Modifier une ligne de réservation
   * PUT /api/lignes-reservation/{id}
   * @requires ROLE: CLIENT, ADMIN, MANAGER
   */
  modifierLigne(
    id: number,
    ligne: LigneReservationRequestDto
  ): Observable<LigneReservationResponseDto> {
    return this.http.put<LigneReservationResponseDto>(
      `${this.API_URL}/${id}`,
      ligne
    );
  }



  // ============================================
  // SUPPRESSION
  // ============================================

  /**
   *  Supprimer une ligne de réservation
   * DELETE /api/lignes-reservation/{id}
   * @requires ROLE: CLIENT, ADMIN, MANAGER
   */
  supprimerLigne(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/${id}`);
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  /**
   * Calculer le montant total des lignes d'une réservation
   * GET /api/lignes-reservation/reservation/{idReservation}/montant
   */
  getMontantTotal(idReservation: number): Observable<{ montantTotal: number }> {
    return this.http.get<{ montantTotal: number }>(
      `${this.API_URL}/reservation/${idReservation}/montant`
    );
  }

  /**
   *  Obtenir les statistiques d'une réservation
   * GET /api/lignes-reservation/reservation/{idReservation}/stats
   */
  getStatistiques(idReservation: number): Observable<any> {
    return this.http.get<any>(
      `${this.API_URL}/reservation/${idReservation}/stats`
    );
  }

  /**
   * Obtenir les instances d'une ligne
   * GET /api/lignes-reservation/{id}/instances
   * @requires ROLE: ADMIN, MANAGER
   */
  getInstancesLigneReservation(id: number): Observable<InstanceProduitResponse[]> {
    return this.http.get<InstanceProduitResponse[]>(
      `${this.API_URL}/${id}/instances`
    );
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  /**
   * Vérifier l'existence d'une ligne
   * GET /api/lignes-reservation/{id}/exists
   */
  verifierExistence(id: number): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/${id}/exists`);
  }
}
