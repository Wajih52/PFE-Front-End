// src/app/features/client/mes-factures/mes-factures.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FactureService } from '../../../services/facture.service';
import { StorageService } from '../../../core/services/storage.service';
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

@Component({
  selector: 'app-mes-factures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mes-factures.component.html',
  styleUrls: ['./mes-factures.component.scss']
})
export class MesFacturesComponent implements OnInit {

  factures: FactureResponse[] = [];
  facturesFiltrees: FactureResponse[] = [];

  // Filtres
  filtreType: TypeFacture | 'TOUS' = 'TOUS';
  filtreStatut: StatutFacture | 'TOUS' = 'TOUS';

  // Tri
  triPar: 'date' | 'montant' | 'type' = 'date';
  triOrdre: 'asc' | 'desc' = 'desc';

  loading: boolean = false;
  erreur: string | null = null;

  // ID de la réservation à filtrer (optionnel)
  filtreReservation: number | null = null;

  // Enums et labels
  readonly TypeFacture = TypeFacture;
  readonly StatutFacture = StatutFacture;
  readonly typeLabels = TypeFactureLabels;
  readonly statutLabels = StatutFactureLabels;
  readonly badgeClasses = StatutFactureBadgeClasses;

  // Statistiques rapides
  get totalFactures(): number {
    return this.factures.length;
  }

  get montantTotal(): number {
    return this.factures.reduce((sum, f) => sum + f.montantTTC, 0);
  }

  get facturesEnAttente(): number {
    return this.factures.filter(f =>
      f.statutFacture === StatutFacture.EN_ATTENTE_VALIDATION_CLIENT ||
      f.statutFacture === StatutFacture.A_REGLER
    ).length;
  }

  constructor(
    private factureService: FactureService,
    private storage: StorageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Vérifier si on filtre par réservation
    this.route.queryParams.subscribe(params => {
      if (params['reservation']) {
        this.filtreReservation = +params['reservation'];
      }
      this.chargerFactures();
    });
  }

  chargerFactures(): void {
    this.loading = true;
    this.erreur = null;

    // Récupérer l'ID du client connecté
    const user = this.storage.getUser();
    if (!user || !user.idUtilisateur) {
      this.erreur = 'Utilisateur non connecté';
      this.loading = false;
      return;
    }

    this.factureService.getFacturesByClient(user.idUtilisateur).subscribe({
      next: (data) => {
        this.factures = data;

        // Filtrer par réservation si demandé
        if (this.filtreReservation) {
          this.factures = this.factures.filter(f =>
            f.idReservation === this.filtreReservation
          );
        }

        this.appliquerFiltres();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement factures:', error);
        this.erreur = 'Impossible de charger vos factures';
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.facturesFiltrees = this.factures.filter(facture => {
      // Filtre type
      if (this.filtreType !== 'TOUS' && facture.typeFacture !== this.filtreType) {
        return false;
      }

      // Filtre statut
      if (this.filtreStatut !== 'TOUS' && facture.statutFacture !== this.filtreStatut) {
        return false;
      }

      return true;
    });

    this.appliquerTri();
  }

  appliquerTri(): void {
    this.facturesFiltrees.sort((a, b) => {
      let comparison = 0;

      switch (this.triPar) {
        case 'date':
          comparison = new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime();
          break;
        case 'montant':
          comparison = a.montantTTC - b.montantTTC;
          break;
        case 'type':
          comparison = a.typeFacture.localeCompare(b.typeFacture);
          break;
      }

      return this.triOrdre === 'asc' ? comparison : -comparison;
    });
  }

  changerTri(critere: 'date' | 'montant' | 'type'): void {
    if (this.triPar === critere) {
      // Inverser l'ordre si même critère
      this.triOrdre = this.triOrdre === 'asc' ? 'desc' : 'asc';
    } else {
      // Nouveau critère, ordre descendant par défaut
      this.triPar = critere;
      this.triOrdre = 'desc';
    }
    this.appliquerTri();
  }

  telechargerPdf(facture: FactureResponse): void {
    this.factureService.downloadFacturePdf(facture.idFacture, facture.numeroFacture);
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

  isFactureEnAttentePaiement(facture: FactureResponse): boolean {
    return facture.statutFacture === StatutFacture.A_REGLER;
  }
}
