// src/app/services/reservation.service.ts

import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DatePeriodeDto,
  DevisModificationDto, ModifierDatesReservationDto,
  StatutReservation,
  ValidationDevisDto,
  VerificationModificationDatesDto
} from '../core/models/reservation.model';

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
  modifierDevisParAdmin(idReservation: number, modificationDto: DevisModificationDto): Observable<ReservationResponseDto> {
    // ✅ On set l'ID dans le DTO comme le fait le controller
    modificationDto.idReservation = idReservation;

    return this.http.put<ReservationResponseDto>(
      `${this.API_URL}/devis/${idReservation}/modifier`,
      modificationDto
    );
  }

  /**
   * Annuler un devis
   * DELETE /api/reservations/devis/{id}
   */
  annulerDevisParAdmin(idReservation: number, motif?: string): Observable<{ message: string }> {
    const params = motif ? new HttpParams().set('motif', motif) : undefined;

    return this.http.delete<{ message: string }>(
      `${this.API_URL}/devis/${idReservation}/annuler`,
      { params }
    );
  }

  /**
   *  Le CLIENT valide ou refuse le devis
   * POST /api/reservations/devis/{id}/valider
   * @requires ROLE: CLIENT
   * ✅ IMPORTANT: Utilise ValidationDevisDto avec "accepter" (pas "accepte")
   */
  validerDevisParClient(idReservation: number, validationDto: ValidationDevisDto): Observable<ReservationResponseDto> {
    // ✅ On set l'ID dans le DTO comme le fait le controller
    validationDto.idReservation = idReservation;

    return this.http.post<ReservationResponseDto>(
      `${this.API_URL}/devis/${idReservation}/valider`,
      validationDto
    );
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
  // ============ GESTION ADMIN ============

  /**
   * Toutes les réservations (ADMIN)
   */
  getAllReservations(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}`);
  }

  /**
   * Tous les devis en attente (ADMIN)
   */
  getAllDevisEnAttente(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/devis-en-attente`);
  }

  /**
   * Filtrer par statut (ADMIN)
   */
  getReservationsByStatut(statut: StatutReservation): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/statut/${statut}`);
  }


  /**
   * 📅 Vérifier si des nouvelles dates sont disponibles pour une réservation
   * POST /api/reservations/{idReservation}/verifier-nouvelles-dates
   * @requires ROLE: CLIENT, ADMIN, EMPLOYE
   */
  verifierNouvellesDates(idReservation: number, nouvellesDates: DatePeriodeDto): Observable<VerificationModificationDatesDto> {
    return this.http.post<VerificationModificationDatesDto>(
      `${this.API_URL}/${idReservation}/verifier-nouvelles-dates`,
      nouvellesDates
    );
  }
  /**
   * 📅 Modifier les dates d'une réservation
   * PUT /api/reservations/{idReservation}/modifier-dates
   * @requires ROLE: CLIENT (ses réservations), ADMIN, MANAGER
   */
  modifierDatesReservation(idReservation: number, modificationDto: ModifierDatesReservationDto): Observable<ReservationResponseDto> {
    modificationDto.idReservation = idReservation;

    return this.http.put<ReservationResponseDto>(
      `${this.API_URL}/${idReservation}/modifier-dates`,
      modificationDto
    );
  }

  // ============================================
  // PARTIE 6: ALERTES ET NOTIFICATIONS (ADMIN)
  // ============================================

  /**
   * 🔔 Réservations qui commencent bientôt
   * GET /api/reservations/alertes/commencant-dans/{nbreJours}
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  getReservationsCommencantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/commencant-dans/${nbreJours}`
    );
  }

  /**
   * 🔔 Réservations qui se terminent bientôt
   * GET /api/reservations/alertes/finissant-dans/{nbreJours}
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  getReservationsFinissantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/finissant-dans/${nbreJours}`
    );
  }

  /**
   * 🔔 Devis expirés (pour relance client)
   * GET /api/reservations/alertes/devis-expires/{nbreJours}
   * @requires ROLE: ADMIN, MANAGER
   */
  getDevisExpires(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires/${nbreJours}`
    );
  }

  /**
   * 🔔 Devis expirés aujourd'hui
   * GET /api/reservations/alertes/devis-expires-ajourdhui
   * @requires ROLE: ADMIN, MANAGER
   */
  getDevisExpiresToday(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires-ajourdhui`
    );
  }

  /**
   * 💰 Réservations avec paiement incomplet
   * GET /api/reservations/alertes/paiements-incomplets
   * @requires ROLE: ADMIN, MANAGER
   */
  getReservationsAvecPaiementIncomplet(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/paiements-incomplets`
    );
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Formater une date pour l'API (Format: YYYY-MM-DD)
   */
  formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Parser une date venant de l'API (Format: YYYY-MM-DD)
   */
  parseDateFromApi(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Calculer le nombre de jours entre deux dates
   */
  calculateDaysBetween(dateDebut: string | Date, dateFin: string | Date): number {
    const start = typeof dateDebut === 'string' ? new Date(dateDebut) : dateDebut;
    const end = typeof dateFin === 'string' ? new Date(dateFin) : dateFin;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifier si une réservation est un devis en attente
   */
  isDevisEnAttente(reservation: ReservationResponseDto): boolean {
    return reservation.estDevis && reservation.statutReservation === 'EN_ATTENTE';
  }

  /**
   * Vérifier si une réservation est confirmée
   */
  isReservationConfirmee(reservation: ReservationResponseDto): boolean {
    return reservation.statutReservation === 'CONFIRME';
  }

  /**
   * Vérifier si le paiement est complet
   */
  isPaiementComplet(reservation: ReservationResponseDto): boolean {
    return reservation.paiementComplet || reservation.montantRestant <= 0;
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
