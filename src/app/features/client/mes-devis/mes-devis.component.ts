// src/app/features/client/mes-devis/mes-devis.component.ts
// 📋 Composant CLIENT - Mes devis en attente de validation

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import { ReservationService } from '../../../services/reservation.service';
import { ReservationResponseDto, ValidationDevisDto } from '../../../core/models/reservation.model';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-mes-devis',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-devis.component.html',
  styleUrls: ['./mes-devis.component.scss']
})
export class MesDevisComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  // Signals
  devis = signal<ReservationResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modals
  showConfirmModal = signal<boolean>(false);
  showRejectModal = signal<boolean>(false);
  selectedDevis = signal<ReservationResponseDto | null>(null);
  motifRefus = signal<string>('');

  ngOnInit(): void {
    this.chargerMesDevis();
  }

  /**
   * Charger tous les devis en attente du client
   */
  chargerMesDevis(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getMesDevisEnAttente().subscribe({
      next: (data) => {
        this.devis.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des devis:', error);
        this.errorMessage.set('Impossible de charger vos devis. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  getPrixIntermediaire(
    montantTotal: number,
    remisePourcentage?: number,
    remiseMontant?: number
  ): number {
    if (remisePourcentage != null && remisePourcentage > 0) {
      return montantTotal / (1 - remisePourcentage / 100);
    }
    if (remiseMontant != null  && remiseMontant > 0) {
      return montantTotal + remiseMontant;
    }
    return montantTotal; // aucune remise
  }

  /**
   * Voir les détails d'un devis
   */
  voirDetails(idReservation: number): void {
    this.router.navigate(['/client/reservation-details', idReservation]);
  }

  /**
   * Ouvrir le modal de confirmation d'acceptation
   */
  ouvrirModalAccepter(devis: ReservationResponseDto): void {
    this.selectedDevis.set(devis);
    this.showConfirmModal.set(true);
  }

  /**
   * Ouvrir le modal de refus
   */
  ouvrirModalRefuser(devis: ReservationResponseDto): void {
    this.selectedDevis.set(devis);
    this.motifRefus.set('');
    this.showRejectModal.set(true);
  }

  /**
   * Accepter le devis
   */
  accepterDevis(): void {
    const devis = this.selectedDevis();
    if (!devis) return;

    const validationDto: ValidationDevisDto = {
      idReservation: devis.idReservation,
      accepter: true
    };

    this.reservationService.validerDevisParClient(devis.idReservation, validationDto).subscribe({
      next: () => {
        this.successMessage.set('✅ Devis accepté avec succès ! Votre réservation est maintenant confirmée.');
        this.showConfirmModal.set(false);
        this.chargerMesDevis(); // Recharger la liste

        // Rediriger vers mes commandes après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/client/mes-commandes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'acceptation du devis:', error);
        this.errorMessage.set('Impossible d\'accepter le devis. Veuillez réessayer');
        this.showConfirmModal.set(false);
      }
    });
  }

  /**
   * Refuser le devis
   */
  refuserDevis(): void {
    const devis = this.selectedDevis();
    if (!devis) return;

    if (!this.motifRefus().trim()) {
      this.errorMessage.set('Veuillez indiquer un motif de refus.');
      return;
    }

    const validationDto: ValidationDevisDto = {
      idReservation: devis.idReservation,
      accepter: false,
      motifRefus: this.motifRefus()
    };

    this.reservationService.validerDevisParClient(devis.idReservation, validationDto).subscribe({
      next: () => {
        this.successMessage.set('Devis refusé. Vous pouvez créer un nouveau devis à tout moment.');
        this.showRejectModal.set(false);
        this.chargerMesDevis(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur lors du refus du devis:', error);
        this.errorMessage.set('Impossible de refuser le devis. Veuillez réessayer.');
        this.showRejectModal.set(false);
      }
    });
  }

  /**
   * Fermer les modals
   */
  fermerModals(): void {
    this.showConfirmModal.set(false);
    this.showRejectModal.set(false);
    this.selectedDevis.set(null);
    this.motifRefus.set('');
  }

  /**
   * Calculer les jours restants avant expiration du devis
   */
  joursRestants(dateCreation: string): number {
    const creation = new Date(dateCreation);
    const expiration = new Date(creation);
    expiration.setDate(expiration.getDate() + 7); // Devis valable 7 jours

    const today = new Date();
    const diff = expiration.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifier si un devis est proche de l'expiration
   */
  estProcheExpiration(dateCreation: string): boolean {
    return this.joursRestants(dateCreation) <= 2;
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
   * Formater une date avec heure
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
