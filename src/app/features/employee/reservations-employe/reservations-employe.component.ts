// src/app/features/employee/reservations-employe/reservations-employe.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import {
  ReservationResponseDto,
  StatutReservationLabels,
  StatutReservationBadgeClasses
} from '../../../core/models/reservation.model';

 const StatutReservation = {
  EN_ATTENTE: 'EN_ATTENTE',
  CONFIRME: 'CONFIRME',
  ANNULE: 'ANNULE',
  TERMINE: 'TERMINE'
}

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

  ngOnInit(): void {
    this.chargerReservations();
  }

  private chargerReservations(): void {
    this.isLoading.set(true);

    // Les employés peuvent voir toutes les réservations pour suivre l'activité
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations.set(reservations);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
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
}
