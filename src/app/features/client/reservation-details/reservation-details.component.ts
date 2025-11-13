// src/app/features/client/reservation-details/reservation-details.component.ts
// 📋 Composant détails réservation/devis avec modification dates et annulation

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import {
  ReservationResponseDto,
  LigneReservationResponseDto,
  ModifierUneLigneRequestDto,
  DecalerToutesLignesRequestDto,
  ModificationDatesResponseDto,
  StatutReservationLabels
} from '../../../core/models/reservation.model';
import {ProduitResponse} from '../../../core/models';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})
export class ReservationDetailsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Signals
  reservation = signal<ReservationResponseDto | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modals
  showDecalageModal = signal<boolean>(false);
  showModifierLigneModal = signal<boolean>(false);
  showAnnulerModal = signal<boolean>(false);

  // Formulaires
  nombreJoursDecalage = signal<number>(0);
  motifDecalage = signal<string>('');

  ligneSelectionnee = signal<LigneReservationResponseDto | null>(null);
  nouvelleDateDebut = signal<string>('');
  nouvelleDateFin = signal<string>('');
  motifModifLigne = signal<string>('');

  motifAnnulation = signal<string>('');

  get res() {
    return this.reservation();
  }

  // Labels
  readonly statutLabels = StatutReservationLabels;

  ngOnInit(): void {
    const idReservation = this.route.snapshot.params['id'];
    if (idReservation) {
      this.chargerReservation(+idReservation);
    }
  }

  /**
   * Charger les détails de la réservation
   */
  chargerReservation(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservation.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.errorMessage.set('Impossible de charger les détails. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  // ============================================
  // DÉCALAGE GLOBAL
  // ============================================

  /**
   * Ouvrir le modal de décalage global
   */
  ouvrirModalDecalage(): void {
    this.nombreJoursDecalage.set(0);
    this.motifDecalage.set('');
    this.showDecalageModal.set(true);
  }

  /**
   * Décaler toutes les lignes
   */
  decalerToutesLesLignes(): void {
    const reservation = this.reservation();
    if (!reservation) return;

    if (this.nombreJoursDecalage() === 0) {
      this.errorMessage.set('Veuillez indiquer un nombre de jours.');
      return;
    }

    if (!this.motifDecalage().trim()) {
      this.errorMessage.set('Veuillez indiquer un motif.');
      return;
    }

    const request: DecalerToutesLignesRequestDto = {
      nombreJours: this.nombreJoursDecalage(),
      motif: this.motifDecalage()
    };

    this.reservationService.decalerToutesLesLignes(reservation.idReservation, request).subscribe({
      next: (response) => {
        this.successMessage.set(` Dates décalées de ${request.nombreJours} jour(s) avec succès !`);
        this.showDecalageModal.set(false);
        this.afficherRecapitulatif(response);
        // Recharger les données
        this.chargerReservation(reservation.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors du décalage:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de décaler les dates. Vérifiez la disponibilité.');
        this.showDecalageModal.set(false);
      }
    });
  }

  // ============================================
  // MODIFICATION D'UNE LIGNE
  // ============================================

  /**
   * Ouvrir le modal de modification d'une ligne
   */
  ouvrirModalModifierLigne(ligne: LigneReservationResponseDto): void {
    this.ligneSelectionnee.set(ligne);
    this.nouvelleDateDebut.set(ligne.dateDebut);
    this.nouvelleDateFin.set(ligne.dateFin);
    this.motifModifLigne.set('');
    this.showModifierLigneModal.set(true);
  }

  /**
   * Modifier une ligne spécifique
   */
  modifierUneLigne(): void {
    const reservation = this.reservation();
    const ligne = this.ligneSelectionnee();
    if (!reservation || !ligne) return;

    if (!this.nouvelleDateDebut() || !this.nouvelleDateFin()) {
      this.errorMessage.set('Veuillez renseigner les deux dates.');
      return;
    }

    const request: ModifierUneLigneRequestDto = {
      nouvelleDateDebut: this.nouvelleDateDebut(),
      nouvelleDateFin: this.nouvelleDateFin(),
      motif: this.motifModifLigne()
    };

    this.reservationService.modifierUneLigne(
      reservation.idReservation,
      ligne.idLigneReservation,
      request
    ).subscribe({
      next: (response) => {
        this.successMessage.set(` Ligne "${ligne.nomProduit}" modifiée avec succès !`);
        this.showModifierLigneModal.set(false);
        this.afficherRecapitulatif(response);
        // Recharger les données
        this.chargerReservation(reservation.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de modifier cette ligne. Vérifiez la disponibilité.');
        this.showModifierLigneModal.set(false);
      }
    });
  }

  // ============================================
  // ANNULATION
  // ============================================

  /**
   * Ouvrir le modal d'annulation
   */
  ouvrirModalAnnuler(): void {
    this.motifAnnulation.set('');
    this.showAnnulerModal.set(true);
  }

  /**
   * Annuler la réservation
   */
  annulerReservation(): void {
    const reservation = this.reservation();
    if (!reservation) return;

    this.reservationService.annulerReservationParClient(
      reservation.idReservation,
      this.motifAnnulation()
    ).subscribe({
      next: () => {
        this.successMessage.set(' Réservation annulée avec succès.');
        this.showAnnulerModal.set(false);

        // Rediriger vers mes commandes après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/client/mes-commandes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.errorMessage.set(error.error?.message || 'Impossible d\'annuler la réservation.');
        this.showAnnulerModal.set(false);
      }
    });
  }

  /**
   * Afficher le récapitulatif des modifications
   */
  afficherRecapitulatif(response: ModificationDatesResponseDto): void {
    console.log('📊 Récapitulatif des modifications:', response);
    // Vous pouvez afficher un modal avec les détails des modifications
  }

  // ============================================
  // HELPERS
  // ============================================

  fermerModals(): void {
    this.showDecalageModal.set(false);
    this.showModifierLigneModal.set(false);
    this.showAnnulerModal.set(false);
  }

  peutModifier(): boolean {
    const res = this.reservation();
    if (!res) return false;
    return (res.statutReservation === 'CONFIRME' || res.statutReservation === 'EN_ATTENTE') &&
      new Date(res.dateDebut) > new Date();
  }

  peutAnnuler(): boolean {
    const res = this.reservation();
    if (!res) return false;
    return (res.statutReservation === 'CONFIRME' || res.statutReservation === 'EN_ATTENTE') &&
      new Date(res.dateDebut) > new Date();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

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
  calculerJours(dateDebut: string, dateFin: string): number {
    return this.reservationService.calculateDaysBetween(dateDebut, dateFin);
  }

  getStatutBadgeClass(statut: string): string {
    return this.reservationService.getStatutBadgeClass(statut as any);
  }

  retourListeCommandes(): void {
    const res = this.reservation();
    if (res?.estDevis) {
      this.router.navigate(['/client/mes-devis']);
    } else {
      this.router.navigate(['/client/mes-commandes']);
    }
  }


  /**
   * Obtenir l'URL de l'image du produit
   */
  getImageUrl(ligne: LigneReservationResponseDto): string {
    if (ligne.imageProduit) {
      // Si l'image est un chemin relatif, ajouter le base URL du serveur
      if (ligne.imageProduit.startsWith('/') || ligne.imageProduit.startsWith('uploads/')) {
        return `http://localhost:8080${ligne.imageProduit.startsWith('/') ? '' : '/'}${ligne.imageProduit}`;
      }
      // Si c'est déjà une URL complète, la retourner telle quelle
      return ligne.imageProduit;
    }
    // Image placeholder si pas d'image
    return 'https://via.placeholder.com/300x250/C8A882/FFFFFF?text=' + encodeURIComponent(ligne.nomProduit);
  }
}
