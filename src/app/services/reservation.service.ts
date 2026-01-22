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

import{variables} from '../core/environement/variables';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private readonly API_URL = `${variables.apiUrl}/reservations`;

  // ============================================
  //  VÉRIFICATION DISPONIBILITÉ
  // ============================================
  /**
   * Vérifier la disponibilité d'un produit pour une période
   */
  verifierDisponibilite(verification: VerificationDisponibiliteDto): Observable<DisponibiliteResponseDto> {
    return this.http.post<DisponibiliteResponseDto>(
      `${this.API_URL}/disponibilite/verifier`,
      verification
    );
  }

  /**
   * Vérifier la disponibilité de plusieurs produits
   */
  verifierDisponibilites(verifications: VerificationDisponibiliteDto[]): Observable<DisponibiliteResponseDto[]> {
    return this.http.post<DisponibiliteResponseDto[]>(
      `${this.API_URL}/disponibilite/verifier-plusieurs`,
      verifications
    );
  }

  // ============================================
  // GESTION DES DEVIS (CLIENT)
  // ============================================

  /**
   * Créer un devis (client)
   */
  creerDevis(devisRequest: DevisRequestDto): Observable<ReservationResponseDto> {
    return this.http.post<ReservationResponseDto>(
      `${this.API_URL}/devis`,
      devisRequest
    );
  }

  /**
   *  Le CLIENT valide ou refuse le devis
   */
  validerDevisParClient(idReservation: number, validationDto: ValidationDevisDto): Observable<ReservationResponseDto> {
    validationDto.idReservation = idReservation;
    return this.http.post<ReservationResponseDto>(
      `${this.API_URL}/devis/${idReservation}/valider`,
      validationDto
    );
  }
  // ============================================
  // GESTION DES DEVIS (ADMIN)
  // ============================================
  /**
   * Modifier un devis (ADMIN) - prix, quantités, remise
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
   */
  annulerDevisParAdmin(idReservation: number, motif?: string): Observable<{ message: string }> {
    const params = motif ? new HttpParams().set('motif', motif) : undefined;

    return this.http.delete<{ message: string }>(
      `${this.API_URL}/devis/${idReservation}/annuler`,
      { params }
    );
  }


  // ============================================
  // CONSULTATION DES RÉSERVATIONS
  // ============================================

  /**
   * Récupérer une réservation par ID
   */
  getReservationById(id: number): Observable<ReservationResponseDto> {
    return this.http.get<ReservationResponseDto>(`${this.API_URL}/${id}`);
  }


  /**
   * Récupérer une réservation par référence
   */
  getReservationByReference(reference: string): Observable<ReservationResponseDto> {
    return this.http.get<ReservationResponseDto>(`${this.API_URL}/reference/${reference}`);
  }

  /**
   * Récupérer mes réservations (client connecté)T
   */
  getMesReservations(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/mes-reservations`);
  }

  /**
   * Récupérer mes devis en attente
   */
  getMesDevisEnAttente(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/mes-devis-en-attente`);
  }



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
   * Récupérer les réservations de l'employé connecté
   */
  getMesReservationsAffectees(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/mes-reservations-affectees`);
  }



  // ============================================
  // RECHERCHE AVANCÉE (ADMIN)
  // ============================================
  /**
   * Recherche multicritères
   */
  searchReservations(searchDto: ReservationSearchDto): Observable<ReservationResponseDto[]> {
    return this.http.post<ReservationResponseDto[]>(
      `${this.API_URL}/recherche`,
      searchDto
    );
  }

  /**
   * Réservations dans une période
   */
  getReservationsByPeriode(dateDebut: string, dateFin: string): Observable<ReservationResponseDto[]> {
    const params = new HttpParams()
      .set('dateDebut', dateDebut)
      .set('dateFin', dateFin);
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/periode`, { params });
  }

  /**
   * Réservations à venir
   */
  getReservationsAVenir(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/a-venir`);
  }

  /**
   * Réservations en cours
   */
  getReservationsEnCours(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/en-cours`);
  }

  /**
   * Réservations passées
   */
  getReservationsPassees(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(`${this.API_URL}/passees`);
  }

  // ============================================
  // MODIFICATION DES DATES
  // ============================================

  /**
   * Vérifier si des nouvelles dates sont disponibles (AVANT modification)
   */
  verifierNouvellesDates(idReservation: number, nouvellesDates: DatePeriodeDto): Observable<VerificationModificationDatesDto> {
    return this.http.post<VerificationModificationDatesDto>(
      `${this.API_URL}/${idReservation}/verifier-nouvelles-dates`,
      nouvellesDates
    );
  }

  /**
   *  Modifier UNE ligne spécifique
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
   *  Décaler TOUTES les lignes
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
   * Modifier les dates d'une réservation
   */
  modifierDatesReservation(idReservation: number, modificationDto: ModifierDatesReservationDto): Observable<ReservationResponseDto> {
    modificationDto.idReservation = idReservation;

    return this.http.put<ReservationResponseDto>(
      `${this.API_URL}/${idReservation}/modifier-dates`,
      modificationDto
    );
  }
// ============================================
  // ANNULATION
  // ============================================
  /**
   * Annuler une réservation (CLIENT)
   */
  annulerReservationParClient(idReservation: number, motif?: string): Observable<{ message: string }> {
    const params = motif ? new HttpParams().set('motif', motif) : new HttpParams();
    return this.http.delete<{ message: string }>(
      `${this.API_URL}/${idReservation}/annuler`,
      { params }
    );
  }
  // ============================================
  // ALERTES (ADMIN)
  // ============================================
  /**
   * Réservations qui commencent bientôt
   */
  getReservationsCommencantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/commencant-dans/${nbreJours}`
    );
  }

  /**
   * Réservations qui se terminent bientôt
   */
  getReservationsFinissantDans(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/finissant-dans/${nbreJours}`
    );
  }

  /**
   * Devis expirés
   */
  getDevisExpires(nbreJours: number): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires/${nbreJours}`
    );
  }

  /**
   * Devis expirés aujourd'hui
   */
  getDevisExpiresToday(): Observable<ReservationResponseDto[]> {
    return this.http.get<ReservationResponseDto[]>(
      `${this.API_URL}/alertes/devis-expires-aujourdhui`
    );
  }

  /**
   * Réservations avec paiement incomplet
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
   * Obtenir le badge de statut Reservation avec couleur
   */
  getStatutBadgeClass(statut: StatutReservation): string {
    const badges: Record<StatutReservation, string> = {
      'EN_ATTENTE': 'badge-warning',
      'CONFIRME': 'badge-success',
      'ANNULE': 'badge-danger',
      'TERMINE': 'badge-secondary'
    };
    return badges[statut] || 'badge-default';
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
  validationAutomatique: boolean; // true = commande directe, false = devis
}

export interface LigneReservationRequestDto {
  idProduit: number;
  quantite: number;
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
  observations?: string;
}


