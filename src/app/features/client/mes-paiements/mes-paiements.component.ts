// src/app/features/client/mes-paiements/mes-paiements.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaiementService } from '../../../services/paiement.service';
import {
  PaiementResponseDto,
  StatutPaiement,
  StatutPaiementLabels,
  StatutPaiementBadgeClasses,
  formatMontantTND,
  formatDatePaiement
} from '../../../core/models/paiement.model';

@Component({
  selector: 'app-mes-paiements',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mes-paiements.component.html',
  styleUrls: ['./mes-paiements.component.scss']
})
export class MesPaiementsComponent implements OnInit {

  paiements = signal<PaiementResponseDto[]>([]);
  paiementsFiltres = signal<PaiementResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  // Filtres
  filtreStatut = signal<StatutPaiement | 'TOUS'>('TOUS');
  filtreRecherche = signal<string>('');

  // Modal détails
  showModalDetails = signal<boolean>(false);
  paiementDetails = signal<PaiementResponseDto | null>(null);

  readonly StatutPaiement = StatutPaiement;
  readonly statutLabels = StatutPaiementLabels;
  readonly statutBadgeClasses = StatutPaiementBadgeClasses;

  constructor(private paiementService: PaiementService) {}

  ngOnInit(): void {
    this.chargerMesPaiements();
  }

  chargerMesPaiements(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.paiementService.getMesPaiements().subscribe({
      next: (data) => {
        this.paiements.set(data);
        this.appliquerFiltres();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paiements:', error);
        this.errorMessage.set('Impossible de charger vos paiements. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  appliquerFiltres(): void {
    let filtres = this.paiements();

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      filtres = filtres.filter(p => p.statutPaiement === this.filtreStatut());
    }

    // Filtre par recherche
    if (this.filtreRecherche()) {
      const recherche = this.filtreRecherche().toLowerCase();
      filtres = filtres.filter(p =>
        p.codePaiement.toLowerCase().includes(recherche) ||
        p.referenceReservation.toLowerCase().includes(recherche)
      );
    }

    this.paiementsFiltres.set(filtres);
  }

  onFiltreChange(): void {
    this.appliquerFiltres();
  }

  ouvrirModalDetails(paiement: PaiementResponseDto): void {
    this.paiementDetails.set(paiement);
    this.showModalDetails.set(true);
  }

  fermerModalDetails(): void {
    this.showModalDetails.set(false);
    this.paiementDetails.set(null);
  }

  // Calculs
  get montantTotalPaye(): number {
    return this.paiements()
      .filter(p => p.statutPaiement === StatutPaiement.VALIDE)
      .reduce((sum, p) => sum + p.montantPaiement, 0);
  }

  get nombrePaiementsEnAttente(): number {
    return this.paiements().filter(p => p.statutPaiement === StatutPaiement.EN_ATTENTE).length;
  }

  get nombrePaiementsValides(): number {
    return this.paiements().filter(p => p.statutPaiement === StatutPaiement.VALIDE).length;
  }

  // Helpers
  formatMontant(montant: number): string {
    return formatMontantTND(montant);
  }

  formatDate(date: string): string {
    return formatDatePaiement(date);
  }

  getStatutLabel(statut: StatutPaiement): string {
    return this.statutLabels[statut];
  }

  getStatutBadgeClass(statut: StatutPaiement): string {
    return this.statutBadgeClasses[statut];
  }

  calculerPourcentagePaye(paiement: PaiementResponseDto): number {
    const total = paiement.montantTotalReservation;
    const paye = total - paiement.montantRestantApres;
    return (paye / total) * 100;
  }
}
