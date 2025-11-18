// src/app/features/pages/factures/detail-facture/detail-facture.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FactureService } from '../../../../services/facture.service';
import { ReservationService } from '../../../../services/reservation.service';
import {
  FactureResponse,
  StatutFacture,
  TypeFacture,
  TypeFactureLabels,
  StatutFactureLabels,
  StatutFactureBadgeClasses,
  formatMontantTND,
  formatDateFacture
} from '../../../../core/models/facture.model';
import { ReservationResponseDto } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-detail-facture',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './detail-facture.component.html',
  styleUrls: ['./detail-facture.component.scss']
})
export class DetailFactureComponent implements OnInit {

  facture: FactureResponse | null = null;
  reservation: ReservationResponseDto | null = null;

  loading: boolean = false;
  erreur: string | null = null;
  succes: string | null = null;

  // Édition du statut
  editingStatut: boolean = false;
  nouveauStatut: StatutFacture | null = null;

  // Enums et labels
  readonly StatutFacture = StatutFacture;
  readonly TypeFacture = TypeFacture;
  readonly typeLabels = TypeFactureLabels;
  readonly statutLabels = StatutFactureLabels;
  readonly badgeClasses = StatutFactureBadgeClasses;

  // Statuts disponibles selon le type de facture
  get statutsDisponibles(): StatutFacture[] {
    if (!this.facture) return [];

    switch (this.facture.typeFacture) {
      case TypeFacture.DEVIS:
        return [
          StatutFacture.EN_ATTENTE_VALIDATION_CLIENT,
          StatutFacture.ANNULEE
        ];
      case TypeFacture.PRO_FORMA:
        return [
          StatutFacture.EN_ATTENTE_LIVRAISON,
          StatutFacture.ANNULEE
        ];
      case TypeFacture.FINALE:
        return [
          StatutFacture.A_REGLER,
          StatutFacture.PAYEE,
          StatutFacture.ANNULEE
        ];
      default:
        return [];
    }
  }

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

  activerEditionStatut(): void {
    if (!this.facture) return;
    this.editingStatut = true;
    this.nouveauStatut = this.facture.statutFacture;
  }

  annulerEditionStatut(): void {
    this.editingStatut = false;
    this.nouveauStatut = null;
    this.erreur = null;
  }

  modifierStatut(): void {
    if (!this.facture || !this.nouveauStatut) return;

    if (this.nouveauStatut === this.facture.statutFacture) {
      this.annulerEditionStatut();
      return;
    }

    this.loading = true;
    this.erreur = null;

    this.factureService.updateStatutFacture(this.facture.idFacture, this.nouveauStatut)
      .subscribe({
        next: (data) => {
          this.facture = data;
          this.succes = 'Statut modifié avec succès';
          this.editingStatut = false;
          this.loading = false;

          setTimeout(() => {
            this.succes = null;
          }, 3000);
        },
        error: (error) => {
          console.error('Erreur modification statut:', error);
          this.erreur = 'Erreur lors de la modification du statut';
          this.loading = false;
        }
      });
  }

  regenererPdf(): void {
    if (!this.facture) return;

    if (!confirm('Êtes-vous sûr de vouloir régénérer le PDF de cette facture ?')) {
      return;
    }

    this.loading = true;
    this.erreur = null;

    this.factureService.regenererPdfFacture(this.facture.idFacture).subscribe({
      next: (data) => {
        this.facture = data;
        this.succes = 'PDF régénéré avec succès';
        this.loading = false;

        setTimeout(() => {
          this.succes = null;
        }, 3000);
      },
      error: (error) => {
        console.error('Erreur régénération PDF:', error);
        this.erreur = 'Erreur lors de la régénération du PDF';
        this.loading = false;
      }
    });
  }

  voirReservation(): void {
    if (!this.facture) return;
    this.router.navigate(['/admin/reservations', this.facture.idReservation]);
  }

  retourListe(): void {
    this.router.navigate(['/admin/factures']);
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
}
