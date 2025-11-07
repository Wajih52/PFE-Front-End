// src/app/services/reservation.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Service de gestion des réservations et devis
 * Sprint 4 - Gestion des réservations
 */
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/reservations';

  // ============ VÉRIFICATION DISPONIBILITÉ ============

  /**
   * Vérifier la disponibilité d'un produit pour une période
   * POST /api/reservations/disponibilite/verifier
   */
  verifierDisponibilite(verification: VerificationDisponibiliteDto): Observable<DisponibiliteResponseDto> {
    return this.http.post<DisponibiliteResponseDto>(
      `${this.API_URL}/disponibilite/verifier`,
      verification
    );
  }

  /**
   * Vérifier la disponibilité de plusieurs produits
   * POST /api/reservations/disponibilite/verifier-plusieurs
   */
  verifierDisponibilites(verifications: VerificationDisponibiliteDto[]): Observable<DisponibiliteResponseDto[]> {
    return this.http.post<DisponibiliteResponseDto[]>(
      `${this.API_URL}/disponibilite/verifier-plusieurs`,
      verifications
    );
  }

  // ============ GESTION DES DEVIS ============

  /**
   * Créer un devis (client)
   * POST /api/reservations/devis
   * @requires ROLE: CLIENT
   */
  creerDevis(devisRequest: DevisRequestDto): Observable<ReservationResponseDto> {
    return this.http.post<ReservationResponseDto>(
      `${this.API_URL}/devis`,
      devisRequest
    );
  }

  /**
   * Valider un devis (client accepte ou refuse)
   * POST /api/reservations/devis/{id}/valider
   * @requires ROLE: CLIENT
   */
  validerDevis(idReservation: number, accepte: boolean): Observable<ReservationResponseDto> {
    return this.http.post<ReservationResponseDto>(
      `${this.API_URL}/devis/${idReservation}/valider`,
      { accepte }
    );
  }

  /**
   * Annuler un devis
   * DELETE /api/reservations/devis/{id}
   */
  annulerDevis(idReservation: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/devis/${idReservation}`);
  }

  // ============ CONSULTATION ============

  /**
   * Récupérer mes réservations (client connecté)
   * GET /api/reservations/mes-reservations
   * @requires ROLE: CLIENT
   */
  getMesReservations(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/mes-reservations`);
  }

  /**
   * Récupérer mes devis en attente
   * GET /api/reservations/mes-devis-en-attente
   * @requires ROLE: CLIENT
   */
  getMesDevisEnAttente(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/mes-devis-en-attente`);
  }

  /**
   * Récupérer une réservation par ID
   * GET /api/reservations/{id}
   */
  getReservationById(id: number): Observable<ReservationResponseDto> {
    return this.http.get<ReservationResponseDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Récupérer une réservation par référence
   * GET /api/reservations/reference/{reference}
   */
  getReservationByReference(reference: string): Observable<ReservationResponseDto> {
    return this.http.get<ReservationResponseDto>(`${this.API_URL}/reference/${reference}`);
  }
}

// ============ DTOs ============

export interface VerificationDisponibiliteDto {
  idProduit: number;
  quantite: number;
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
}

export interface DisponibiliteResponseDto {
  disponible: boolean;
  quantiteDisponible: number;
  message?: string;
}

export interface DevisRequestDto {
  lignesReservation: LigneReservationRequestDto[];
  observationsClient?: string;
  validationAutomatique: boolean; // ⭐ IMPORTANT: true = commande directe, false = devis
}

export interface LigneReservationRequestDto {
  idProduit: number;
  quantite: number;
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
  observations?: string;
}

export interface ReservationResponseDto {
  idReservation: number;
  referenceReservation: string;
  idUtilisateur: number;
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient: number;
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  statutReservation: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'EN_COURS' | 'TERMINE';
  statutLivraisonRes?: string;
  montantOriginal: number;
  remisePourcentage?: number;
  remiseMontant?: number;
  montantTotal: number;
  montantPaye?: number;
  montantRestant: number;
  lignesReservation: LigneReservationResponseDto[];
  observationsClient?: string;
  commentaireAdmin?: string;
  estDevis: boolean;
  paiementComplet: boolean;
  nombreProduits: number;
  joursLocation: number;
}

export interface LigneReservationResponseDto {
  idLigneReservation: number;
  idProduit: number;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  dateDebut: string;
  dateFin: string;
  sousTotal: number;
  typeProduit: 'EN_QUANTITE' | 'AVEC_REFERENCE';
}
