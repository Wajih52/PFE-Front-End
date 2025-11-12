// src/app/features/client/mes-commandes/mes-commandes.component.ts
// 📦 Composant CLIENT - Mes réservations confirmées

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponseDto, StatutReservationLabels } from '../../../core/models/reservation.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.scss']
})
export class MesCommandesComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  // Signals
  reservations = signal<ReservationResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Filtres
  filtreStatut = signal<string>('TOUS');
  rechercheRef = signal<string>('');

  // Labels
  readonly statutLabels = StatutReservationLabels;

  ngOnInit(): void {
    this.chargerMesReservations();
  }

  /**
   * Charger toutes les réservations du client connecté
   */
  chargerMesReservations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getMesReservations().subscribe({
      next: (data) => {
        // Filtrer pour n'afficher que les réservations confirmées (pas les devis)
        const reservationsConfirmees = data.filter(r => r.statutReservation !== 'EN_ATTENTE' || !r.estDevis);
        this.reservations.set(reservationsConfirmees);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.errorMessage.set('Impossible de charger vos commandes. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Obtenir les réservations filtrées
   */
  get reservationsFiltrees(): ReservationResponseDto[] {
    let result = this.reservations();

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      result = result.filter(r => r.statutReservation === this.filtreStatut());
    }

    // Filtre par référence
    if (this.rechercheRef()) {
      const search = this.rechercheRef().toLowerCase();
      result = result.filter(r =>
        r.referenceReservation.toLowerCase().includes(search)
      );
    }

    return result;
  }

  /**
   * Obtenir les statistiques
   */
  get stats() {
    const all = this.reservations();
    return {
      total: all.length,
      confirmees: all.filter(r => r.statutReservation === 'CONFIRME').length,
      enCours: all.filter(r => r.statutReservation === 'EN_COURS').length,
      terminees: all.filter(r => r.statutReservation === 'TERMINE').length,
      annulees: all.filter(r => r.statutReservation === 'ANNULE').length
    };
  }

  /**
   * Voir les détails d'une réservation
   */
  voirDetails(idReservation: number): void {
    this.router.navigate(['/client/reservation-details', idReservation]);
  }

  /**
   * Obtenir la classe CSS du badge de statut
   */
  getStatutBadgeClass(statut: string): string {
    return this.reservationService.getStatutBadgeClass(statut as any);
  }

  /**
   * Formater une date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Vérifier si une réservation peut être modifiée
   */
  peutModifier(reservation: ReservationResponseDto): boolean {
    return reservation.statutReservation === 'CONFIRME' &&
      new Date(reservation.dateDebut) > new Date();
  }

  /**
   * Vérifier si une réservation peut être annulée
   */
  peutAnnuler(reservation: ReservationResponseDto): boolean {
    return (reservation.statutReservation === 'CONFIRME' || reservation.statutReservation === 'EN_ATTENTE') &&
      new Date(reservation.dateDebut) > new Date();
  }
}
