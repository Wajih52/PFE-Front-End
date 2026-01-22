// src/app/features/employee/reservations-employe/reservations-employe.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import {
  ReservationResponseDto,
  StatutReservationLabels,
  StatutReservationBadgeClasses, StatutLivraisonLabels
} from '../../../core/models/reservation.model';
import {StorageService} from '../../../core/services/storage.service';
import {LivraisonService} from '../../../services/livraison.service';

 const StatutReservation = {
  EN_ATTENTE: 'EN_ATTENTE',
  CONFIRME: 'CONFIRME',
  ANNULE: 'ANNULE',
  TERMINE: 'TERMINE'
} as const;

 type StatutReservationn =
  | 'EN_ATTENTE'
  | 'CONFIRME'
  | 'ANNULE'
  | 'TERMINE';


type FiltrePeriode = 'toutes' | 'a-venir' | 'en-cours' | 'passees';

/**
 * Liste des réservations pour les employés
 * Affiche toutes les réservations pour suivre l'activité
 */
@Component({
  selector: 'app-reservations-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservations-employe.component.html',
  styleUrls: ['./reservations-employe.component.scss']
})
export class ReservationsEmployeComponent implements OnInit {
  private reservationService = inject(ReservationService);


  // Signals
  reservations = signal<ReservationResponseDto[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string>('');

  //  Gestion du modal (détail reservation )
  showModal = signal<boolean>(false);
  reservationSelectionnee = signal<ReservationResponseDto | null>(null);

  // Filtres
  filtreStatut = signal<StatutReservationn | 'TOUS'>('TOUS');
  filtrePeriode = signal<FiltrePeriode>('toutes');
  filtreRecherche = signal<string>('');

  // Computed - Réservations filtrées
  reservationsFiltrees = computed(() => {
    let result = [...this.reservations()];

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      result = result.filter(r => r.statutReservation === this.filtreStatut());
    }

    // Filtre par période
    const today = new Date().toISOString().split('T')[0];
    switch (this.filtrePeriode()) {
      case 'a-venir':
        result = result.filter(r =>
          r.dateDebut > today &&
          r.statutReservation !== StatutReservation.ANNULE
        );
        break;
      case 'en-cours':
        result = result.filter(r =>
          r.dateDebut <= today &&
          r.dateFin >= today &&
          r.statutReservation === StatutReservation.CONFIRME
        );
        break;
      case 'passees':
        result = result.filter(r => r.dateFin < today);
        break;
    }

    // Filtre par recherche
    const recherche = this.filtreRecherche().toLowerCase();
    if (recherche) {
      result = result.filter(r =>
        r.referenceReservation.toLowerCase().includes(recherche) ||
        r.nomClient.toLowerCase().includes(recherche) ||
        r.prenomClient.toLowerCase().includes(recherche)
      );
    }

    // Trier par date de début (plus récentes en premier)
    return result.sort((a, b) =>
      new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
    );
  });

  // Statistiques
  stats = computed(() => {
    const total = this.reservations().length;
    const aVenir = this.reservations().filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.dateDebut > today && r.statutReservation !== StatutReservation.ANNULE;
    }).length;
    const enCours = this.reservations().filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.dateDebut <= today && r.dateFin >= today &&
        r.statutReservation === StatutReservation.CONFIRME;
    }).length;

    return { total, aVenir, enCours };
  });

  // Helpers
  readonly StatutReservation = StatutReservation;
  readonly StatutReservationLabels = StatutReservationLabels;
  readonly StatutReservationBadgeClasses = StatutReservationBadgeClasses;
  statutLivraisonLabels = StatutLivraisonLabels;

  ngOnInit(): void {
    this.chargerMesReservations();
  }

  /**
   * Charger les réservations où l'employé est affecté
   */
  chargerMesReservations(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getMesReservationsAffectees().subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.isLoading.set(false);
        console.log(`${reservations.length} réservations chargées`);
      },
      error: (error) => {
        console.error('Erreur chargement réservations:', error);
        this.errorMessage.set(
          error.error?.message || 'Erreur lors du chargement de vos réservations'
        );
        this.isLoading.set(false);
      }
    });
  }

  // Méthodes de filtre
  changerStatut(statut: StatutReservationn | 'TOUS'): void {
    this.filtreStatut.set(statut);
  }

  changerPeriode(periode: FiltrePeriode): void {
    this.filtrePeriode.set(periode);
  }

  changerRecherche(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtreRecherche.set(input.value);
  }
  //  Ouvrir le modal avec les détails
  ouvrirModal(reservation: ReservationResponseDto): void {
    this.reservationSelectionnee.set(reservation);
    this.showModal.set(true);
    // Empêcher le scroll du body
    document.body.style.overflow = 'hidden';
  }

  // Fermer le modal
  fermerModal(): void {
    this.showModal.set(false);
    this.reservationSelectionnee.set(null);
    // Réactiver le scroll du body
    document.body.style.overflow = 'auto';
  }


  // Méthodes d'affichage
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND'
    }).format(montant);
  }

  getStatutClass(statut: StatutReservationn): string {
    return StatutReservationBadgeClasses[statut] || 'badge-secondary';
  }

  getStatutLabel(statut: StatutReservationn): string {
    return StatutReservationLabels[statut] || statut;
  }

  getNombreJours(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    const diff = fin.getTime() - debut.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  // Obtenir la couleur du badge selon le statut de livraison
  getStatutLivraisonColor(statut: string ): string {
    const colors: Record<string, string> = {
      'NOT_TODAY': '#95a5a6',
      'EN_ATTENTE': '#f39c12',
      'EN_COURS': '#3498db',
      'LIVREE': '#27ae60',
      'RETOUR': '#9b59b6',
      'RETOUR_PARTIEL': '#e67e22',
      'RETOURNEE': '#16a085',
      'ANNULEE': '#e74c3c'
    };
    return colors[statut] || '#95a5a6';
  }

  // Helper pour obtenir le label du statut de livraison
  getStatutLivraisonLabel(statut: string): string {
    return this.statutLivraisonLabels[statut as keyof typeof this.statutLivraisonLabels] || statut;
  }
}
