// src/app/features/pages/factures/liste-factures/liste-factures.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FactureService } from '../../../../services/facture.service';
import {
  FactureResponse,
  TypeFacture,
  StatutFacture,
  TypeFactureLabels,
  StatutFactureLabels,
  StatutFactureBadgeClasses,
  formatMontantTND,
  formatDateFacture
} from '../../../../core/models/facture.model';

@Component({
  selector: 'app-liste-factures',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './liste-factures.component.html',
  styleUrls: ['./liste-factures.component.scss']
})
export class ListeFacturesComponent implements OnInit {

  factures: FactureResponse[] = [];
  facturesFiltrees: FactureResponse[] = [];

  // Filtres
  filtreType: TypeFacture | 'TOUS' = 'TOUS';
  filtreStatut: StatutFacture | 'TOUS' = 'TOUS';
  filtreRecherche: string = '';

  loading: boolean = false;
  erreur: string | null = null;

  // Enums et labels
  readonly TypeFacture = TypeFacture;
  readonly StatutFacture = StatutFacture;
  readonly typeLabels = TypeFactureLabels;
  readonly statutLabels = StatutFactureLabels;
  readonly badgeClasses = StatutFactureBadgeClasses;

  constructor(private factureService: FactureService) {}

  ngOnInit(): void {
    this.chargerFactures();
  }

  chargerFactures(): void {
    this.loading = true;
    this.erreur = null;

    this.factureService.getAllFactures().subscribe({
      next: (data) => {
        this.factures = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement factures:', error);
        this.erreur = 'Impossible de charger les factures';
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

      // Filtre recherche
      if (this.filtreRecherche) {
        const recherche = this.filtreRecherche.toLowerCase();
        return (
          facture.numeroFacture.toLowerCase().includes(recherche) ||
          facture.referenceReservation.toLowerCase().includes(recherche) ||
          facture.nomClient.toLowerCase().includes(recherche) ||
          facture.prenomClient.toLowerCase().includes(recherche)
        );
      }

      return true;
    });
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
}
