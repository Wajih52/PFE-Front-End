// src/app/features/pages/paiement/liste-paiements/liste-paiements.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PaiementService } from '../../../../services/paiement.service';
import {
  PaiementResponseDto,
  StatutPaiement,
  StatutPaiementLabels,
  StatutPaiementBadgeClasses,
  formatMontantTND,
  formatDatePaiement
} from '../../../../core/models/paiement.model';

type TriOption = 'date' | 'montant' | 'client' | 'reservation';

@Component({
  selector: 'app-liste-paiements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './liste-paiements.component.html',
  styleUrls: ['./liste-paiements.component.scss']
})
export class ListePaiementsComponent implements OnInit {

  paiements: PaiementResponseDto[] = [];
  paiementsFiltres: PaiementResponseDto[] = [];

  // Filtres
  filtreStatut: StatutPaiement | 'TOUS' = 'TOUS';
  filtreRecherche: string = '';
  filtreMontantMin: number | null = null;
  filtreMontantMax: number | null = null;
  filtreDateDebut: string = '';
  filtreDateFin: string = '';

  // Tri
  triActif: TriOption = 'date';
  triOrdre: 'asc' | 'desc' = 'desc';

  loading: boolean = false;
  erreur: string | null = null;

  page: number = 1;
  pageSize: number = 10;

  readonly StatutPaiement = StatutPaiement;
  readonly statutLabels = StatutPaiementLabels;
  readonly statutBadgeClasses = StatutPaiementBadgeClasses;

  // Modal détails
  showModalDetails: boolean = false;
  paiementDetails: PaiementResponseDto | null = null;

  // Modal refus
  showModalRefus: boolean = false;
  paiementARefuser: PaiementResponseDto | null = null;
  motifRefus: string = '';

  constructor(private paiementService: PaiementService) { }

  ngOnInit(): void {
    this.chargerPaiements();
  }

  chargerPaiements(): void {
    this.loading = true;
    this.erreur = null;

    this.paiementService.getAllPaiements().subscribe({
      next: (data) => {
        this.paiements = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paiements:', error);
        this.erreur = 'Impossible de charger les paiements';
        this.loading = false;
      }
    });
  }

  chargerPaiementsEnAttente(): void {
    this.loading = true;
    this.filtreStatut = StatutPaiement.EN_ATTENTE;

    this.paiementService.getPaiementsEnAttente().subscribe({
      next: (data) => {
        this.paiements = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.erreur = 'Impossible de charger les paiements en attente';
        this.loading = false;
      }
    });
  }

  chargerPaiementsParPeriode(): void {
    if (!this.filtreDateDebut || !this.filtreDateFin) {
      alert('Veuillez sélectionner une date de début et de fin');
      return;
    }

    this.loading = true;
    const dateDebut = new Date(this.filtreDateDebut + 'T00:00:00');
    const dateFin = new Date(this.filtreDateFin + 'T23:59:59');

    this.paiementService.getPaiementsByPeriode(dateDebut, dateFin).subscribe({
      next: (data) => {
        this.paiements = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.erreur = 'Impossible de charger les paiements pour cette période';
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    this.paiementsFiltres = this.paiements;

    // Filtre par statut
    if (this.filtreStatut !== 'TOUS') {
      this.paiementsFiltres = this.paiementsFiltres.filter(p => p.statutPaiement === this.filtreStatut);
    }

    // Filtre par recherche textuelle
    if (this.filtreRecherche) {
      const recherche = this.filtreRecherche.toLowerCase();
      this.paiementsFiltres = this.paiementsFiltres.filter(p =>
        p.codePaiement.toLowerCase().includes(recherche) ||
        p.referenceReservation.toLowerCase().includes(recherche) ||
        `${p.nomClient} ${p.prenomClient}`.toLowerCase().includes(recherche)
      );
    }

    // Filtre par montant min
    if (this.filtreMontantMin !== null && this.filtreMontantMin > 0) {
      this.paiementsFiltres = this.paiementsFiltres.filter(p => p.montantPaiement >= this.filtreMontantMin!);
    }

    // Filtre par montant max
    if (this.filtreMontantMax !== null && this.filtreMontantMax > 0) {
      this.paiementsFiltres = this.paiementsFiltres.filter(p => p.montantPaiement <= this.filtreMontantMax!);
    }

    // Appliquer le tri
    this.appliquerTri();

    this.page = 1;
  }

  appliquerTri(): void {
    this.paiementsFiltres.sort((a, b) => {
      let comparison = 0;

      switch (this.triActif) {
        case 'date':
          comparison = new Date(a.datePaiement).getTime() - new Date(b.datePaiement).getTime();
          break;
        case 'montant':
          comparison = a.montantPaiement - b.montantPaiement;
          break;
        case 'client':
          const nomA = `${a.prenomClient} ${a.nomClient}`.toLowerCase();
          const nomB = `${b.prenomClient} ${b.nomClient}`.toLowerCase();
          comparison = nomA.localeCompare(nomB);
          break;
        case 'reservation':
          comparison = a.referenceReservation.localeCompare(b.referenceReservation);
          break;
      }

      return this.triOrdre === 'asc' ? comparison : -comparison;
    });
  }

  changerTri(option: TriOption): void {
    if (this.triActif === option) {
      this.triOrdre = this.triOrdre === 'asc' ? 'desc' : 'asc';
    } else {
      this.triActif = option;
      this.triOrdre = 'desc';
    }
    this.appliquerTri();
  }

  onFiltreStatutChange(): void {
    this.appliquerFiltres();
  }

  onRechercheChange(): void {
    this.appliquerFiltres();
  }

  onFiltreMontantChange(): void {
    this.appliquerFiltres();
  }

  reinitialiserFiltres(): void {
    this.filtreStatut = 'TOUS';
    this.filtreRecherche = '';
    this.filtreMontantMin = null;
    this.filtreMontantMax = null;
    this.filtreDateDebut = '';
    this.filtreDateFin = '';

    // Réinitialiser aussi les tris
    this.triActif = 'date';
    this.triOrdre = 'desc';

    this.chargerPaiements();
  }

  // Pagination
  get paiementsPagines(): PaiementResponseDto[] {
    const debut = (this.page - 1) * this.pageSize;
    const fin = debut + this.pageSize;
    return this.paiementsFiltres.slice(debut, fin);
  }

  get nombrePages(): number {
    return Math.ceil(this.paiementsFiltres.length / this.pageSize);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.nombrePages) {
      this.page = page;
    }
  }

  // Actions
  validerPaiement(paiement: PaiementResponseDto): void {
    if (!confirm(`Confirmer la validation du paiement ${paiement.codePaiement} de ${formatMontantTND(paiement.montantPaiement)} ?`)) {
      return;
    }

    this.paiementService.validerPaiement(paiement.idPaiement).subscribe({
      next: () => {
        alert('Paiement validé avec succès ✅');
        this.chargerPaiements();
      },
      error: (error) => {
        console.error('Erreur lors de la validation:', error);
        alert('Erreur lors de la validation du paiement');
      }
    });
  }

  ouvrirModalRefus(paiement: PaiementResponseDto): void {
    this.paiementARefuser = paiement;
    this.motifRefus = '';
    this.showModalRefus = true;
  }

  fermerModalRefus(): void {
    this.showModalRefus = false;
    this.paiementARefuser = null;
    this.motifRefus = '';
  }

  confirmerRefus(): void {
    if (!this.motifRefus.trim()) {
      alert('Veuillez saisir un motif de refus');
      return;
    }

    if (!this.paiementARefuser) return;

    this.paiementService.refuserPaiement(this.paiementARefuser.idPaiement, this.motifRefus).subscribe({
      next: () => {
        alert('Paiement refusé ❌');
        this.fermerModalRefus();
        this.chargerPaiements();
      },
      error: (error) => {
        console.error('Erreur lors du refus:', error);
        alert('Erreur lors du refus du paiement');
      }
    });
  }

  ouvrirModalDetails(paiement: PaiementResponseDto): void {
    this.paiementDetails = paiement;
    this.showModalDetails = true;
  }

  fermerModalDetails(): void {
    this.showModalDetails = false;
    this.paiementDetails = null;
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
