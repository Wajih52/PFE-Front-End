// src/app/features/client/mes-factures/detail/detail-facture-client.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FactureService } from '../../../services/facture.service';
import { ReservationService } from '../../../services/reservation.service';
import {
  FactureResponse,
  TypeFacture,
  StatutFacture,
  TypeFactureLabels,
  StatutFactureLabels,
  StatutFactureBadgeClasses,
  formatMontantTND,
  formatDateFacture
} from '../../../core/models/facture.model';
import {LigneReservationResponseDto, ReservationResponseDto} from '../../../core/models/reservation.model';

@Component({
  selector: 'app-detail-facture-client',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail-facture-client.component.html',
  styleUrls: ['./detail-facture-client.component.scss']
})
export class DetailFactureClientComponent implements OnInit {

  facture: FactureResponse | null = null;
  reservation: ReservationResponseDto | null = null;

  loading: boolean = false;
  erreur: string | null = null;

  // Enums et labels
  readonly TypeFacture = TypeFacture;
  readonly StatutFacture = StatutFacture;
  readonly typeLabels = TypeFactureLabels;
  readonly statutLabels = StatutFactureLabels;
  readonly badgeClasses = StatutFactureBadgeClasses;

  constructor(
    private factureService: FactureService,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idFacture = this.route.snapshot.params['id'];
    if (idFacture) {
      this.chargerFacture(+idFacture);
    }
  }

  chargerFacture(idFacture: number): void {
    this.loading = true;
    this.erreur = null;

    this.factureService.getFactureById(idFacture).subscribe({
      next: (data) => {
        this.facture = data;
        this.chargerReservation(data.idReservation);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement facture:', error);
        this.erreur = 'Impossible de charger la facture';
        this.loading = false;
      }
    });
  }

  chargerReservation(idReservation: number): void {
    this.reservationService.getReservationById(idReservation).subscribe({
      next: (data) => {
        this.reservation = data;
      },
      error: (error) => {
        console.error('Erreur chargement réservation:', error);
      }
    });
  }

  telechargerPdf(): void {
    if (!this.facture) return;

    this.factureService.downloadFacturePdf(
      this.facture.idFacture,
      this.facture.numeroFacture
    );
  }

  voirReservation(): void {
    if (!this.facture) return;
    this.router.navigate(['/client/reservation-details',this.facture.idReservation]);
  }

  retourListe(): void {
    this.router.navigate(['/client/mes-factures']);
  }

  formatMontant(montant: number): string {
    return formatMontantTND(montant);
  }

  formatDate(dateStr: string): string {
    return formatDateFacture(dateStr);
  }

  getTypeIcon(type: TypeFacture): string {
    switch (type) {
      case TypeFacture.DEVIS:
        return 'fa-file-invoice';
      case TypeFacture.PRO_FORMA:
        return 'fa-file-invoice-dollar';
      case TypeFacture.FINALE:
        return 'fa-file-contract';
      default:
        return 'fa-file';
    }
  }

  getStatutIcon(statut: StatutFacture): string {
    switch (statut) {
      case StatutFacture.EN_ATTENTE_VALIDATION_CLIENT:
        return 'fa-clock';
      case StatutFacture.EN_ATTENTE_LIVRAISON:
        return 'fa-truck';
      case StatutFacture.A_REGLER:
        return 'fa-exclamation-circle';
      case StatutFacture.PAYEE:
        return 'fa-check-circle';
      case StatutFacture.ANNULEE:
        return 'fa-times-circle';
      default:
        return 'fa-question-circle';
    }
  }

  isFactureEnAttentePaiement(): boolean {
    return this.facture?.statutFacture === StatutFacture.A_REGLER;
  }

  isPaiementComplet(): boolean {
    return this.reservation?.paiementComplet || false;
  }

  getMontantRestant(): number {
    if (!this.reservation) return 0;
    return this.reservation.montantRestant;
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
