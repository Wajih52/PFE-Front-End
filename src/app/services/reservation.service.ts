// src/app/services/reservation.service.ts

import { Injectable, inject } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DatePeriodeDto,
  DecalerToutesLignesRequestDto,
  DevisModificationDto,
  ModificationDatesResponseDto,
  ModifierDatesReservationDto,
  ModifierUneLigneRequestDto, ReservationResponseDto,
  ReservationSearchDto,
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

  // ============================================
  //  VÉRIFICATION DISPONIBILITÉ
  // ============================================
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

  // ============================================
  // PARTIE 2: GESTION DES DEVIS (CLIENT)
  // ============================================

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
  // ============================================
  // PARTIE 3: GESTION DES DEVIS (ADMIN)
  // ============================================
  /**
   * Modifier un devis (ADMIN) - prix, quantités, remise
   * PUT /api/reservations/devis/{id}/modifier
   * @requires ROLE: ADMIN, MANAGER
   */
  modifierDevisParAdmin(idReservation: number, modificationDto: DevisModificationDto): Observable<ReservationResponseDto> {
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


  // ============================================
  // PARTIE 4: CONSULTATION DES RÉSERVATIONS
  // ============================================

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
   * Toutes les réservations (ADMIN)
   * GET /api/reservations
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  getAllReservations(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}`);
  }

  /**
   * Tous les devis en attente (ADMIN)
   * GET /api/reservations/devis-en-attente
   * @requires ROLE: ADMIN, MANAGER
   */
  getAllDevisEnAttente(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/devis-en-attente`);
  }

  /**
   * Filtrer par statut (ADMIN)
   * GET /api/reservations/statut/{statut}
   */
  getReservationsByStatut(statut: StatutReservation): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/statut/${statut}`);
  }



  // ============================================
  // PARTIE 5: RECHERCHE AVANCÉE (ADMIN)
  // ============================================
  /**
   * Recherche multicritères
   * POST /api/reservations/recherche
   * @requires ROLE: ADMIN, MANAGER, EMPLOYE
   */
  searchReservations(searchDto: ReservationSearchDto): Observable<ReservationResponseDto[]> {
    return this.http.post<ReservationResponseDto[]>(
      `${this.API_URL}/recherche`,
      searchDto
    );
  }

  /**
   * Réservations dans une période
   * GET /api/reservations/periode?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD
   */
  getReservationsByPeriode(dateDebut: string, dateFin: string): Observable<ReservationResponseDto[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/periode`, { params });
  }

  /**
   * Réservations à venir
   * GET /api/reservations/a-venir
   */
  getReservationsAVenir(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/a-venir`);
  }

  /**
   * Réservations en cours
   * GET /api/reservations/en-cours
   */
  getReservationsEnCours(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/en-cours`);
  }

  /**
   * Réservations passées
   * GET /api/reservations/passees
   */
  getReservationsPassees(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/passees`);
  }

  // ============================================
  // PARTIE 6: MODIFICATION DES DATES
  // ============================================

  /**
   * Vérifier si des nouvelles dates sont disponibles (AVANT modification)
   * POST /api/reservations/{idReservation}/verifier-nouvelles-dates
   */
  verifierNouvellesDates(idReservation: number, nouvellesDates: DatePeriodeDto): Observable<VerificationModificationDatesDto> {
    return this.http.post<VerificationModificationDatesDto>(
      `${this.API_URL}/${idReservation}/verifier-nouvelles-dates`,
      nouvellesDates
    );
  }

  /**
   * 🎯 FONCTIONNALITÉ 1: Modifier UNE ligne spécifique
   * PUT /api/reservations/{idRes}/ligne/{idLigne}
   * Cas d'usage: Client veut garder les chaises 2 jours de plus
   */
  modifierUneLigne(
    idReservation: number,
    idLigne: number,
    request: ModifierUneLigneRequestDto
  ): Observable<ModificationDatesResponseDto> {
    return this.http.put<ModificationDatesResponseDto>(
      `${this.API_URL}/${idReservation}/lignes/${idLigne}/dates`,
      request
    );
  }

  /**
   * 🎯 FONCTIONNALITÉ 2: Décaler TOUTES les lignes
   * PUT /api/reservations/{idRes}/decaler-tout
   * Cas d'usage: Événement reporté d'une semaine
   */
  decalerToutesLesLignes(
    idReservation: number,
    request: DecalerToutesLignesRequestDto
  ): Observable<ModificationDatesResponseDto> {
    return this.http.put<ModificationDatesResponseDto>(
      `${this.API_URL}/${idReservation}/decaler`,
      request
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
  // PARTIE 7: ANNULATION
  // ============================================
  /**
   * Annuler une réservation (CLIENT)
   * DELETE /api/reservations/{id}/annuler
   */
  annulerReservationParClient(idReservation: number, motif?: string): Observable<{ message: string }> {
    const params = motif ? new HttpParams().set('motif', motif) : new HttpParams();
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${idReservation}/annuler`,
      { params }
    );
  }
  // ============================================
  // PARTIE 8: ALERTES (ADMIN)
  // ============================================
  /**
   * Réservations qui commencent bientôt
   * GET /api/reservations/alertes/commencant-dans/{nbreJours}
   */
  getReservationsCommencantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/commencant-dans/${nbreJours}`
    );
  }

  /**
   * Réservations qui se terminent bientôt
   * GET /api/reservations/alertes/finissant-dans/{nbreJours}
   */
  getReservationsFinissantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/finissant-dans/${nbreJours}`
    );
  }

  /**
   * Devis expirés
   * GET /api/reservations/alertes/devis-expires/{nbreJours}
   */
  getDevisExpires(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires/${nbreJours}`
    );
  }

  /**
   * Devis expirés aujourd'hui
   * GET /api/reservations/alertes/devis-expires-aujourdhui
   */
  getDevisExpiresToday(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires-aujourdhui`
    );
  }

  /**
   * Réservations avec paiement incomplet
   * GET /api/reservations/alertes/paiements-incomplets
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
   * Calculer le nombre de jours entre deux dates (inclusives)
   */
  calculateDaysBetween(dateDebut: string | Date, dateFin: string | Date): number {
    const start = typeof dateDebut === 'string' ? new Date(dateDebut) : dateDebut;
    const end = typeof dateFin === 'string' ? new Date(dateFin) : dateFin;

    // Normaliser les dates à minuit pour éviter les problèmes d'heures
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Ajouter 1 pour inclure à la fois le jour de début et de fin
    return diffDays + 1;
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

  /**
   * Obtenir le badge de statut avec couleur
   */
  getStatutBadgeClass(statut: StatutReservation): string {
    const badges: Record<StatutReservation, string> = {
      'EN_ATTENTE': 'badge-warning',
      'CONFIRME': 'badge-success',
      'ANNULE': 'badge-danger',
      'EN_COURS': 'badge-info',
      'TERMINE': 'badge-secondary'
    };
    return badges[statut] || 'badge-default';
  }

  /**
   * Obtenir le label français du statut
   */
  getStatutLabel(statut: StatutReservation): string {
    const labels: Record<StatutReservation, string> = {
      'EN_ATTENTE': 'En attente',
      'CONFIRME': 'Confirmée',
      'ANNULE': 'Annulée',
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminée'
    };
    return labels[statut] || statut;
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
