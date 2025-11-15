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

  filtreStatut: StatutPaiement | 'TOUS' = 'TOUS';
  filtreRecherche: string = '';

  loading: boolean = false;
  erreur: string | null = null;

  page: number = 1;
  pageSize: number = 10;

  readonly StatutPaiement = StatutPaiement;
  readonly statutLabels = StatutPaiementLabels;
  readonly statutBadgeClasses = StatutPaiementBadgeClasses;

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

  appliquerFiltres(): void {
    this.paiementsFiltres = this.paiements;

    if (this.filtreStatut !== 'TOUS') {
      this.paiementsFiltres = this.paiementsFiltres.filter(p => p.statutPaiement === this.filtreStatut);
    }

    if (this.filtreRecherche) {
      const recherche = this.filtreRecherche.toLowerCase();
      this.paiementsFiltres = this.paiementsFiltres.filter(p =>
        p.codePaiement.toLowerCase().includes(recherche) ||
        p.referenceReservation.toLowerCase().includes(recherche) ||
        `${p.nomClient} ${p.prenomClient}`.toLowerCase().includes(recherche)
      );
    }

    this.page = 1;
  }

  onFiltreStatutChange(): void {
    this.appliquerFiltres();
  }

  onRechercheChange(): void {
    this.appliquerFiltres();
  }

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
    if (!this.paiementARefuser || !this.motifRefus.trim()) {
      alert('Veuillez saisir un motif de refus');
      return;
    }

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

  get paiementsPagines(): PaiementResponseDto[] {
    const debut = (this.page - 1) * this.pageSize;
    const fin = debut + this.pageSize;
    return this.paiementsFiltres.slice(debut, fin);
  }

  get nombrePages(): number {
    return Math.ceil(this.paiementsFiltres.length / this.pageSize);
  }

  changePage(nouvellePage: number): void {
    if (nouvellePage >= 1 && nouvellePage <= this.nombrePages) {
      this.page = nouvellePage;
    }
  }

  formatMontant(montant: number): string {
    return formatMontantTND(montant);
  }

  formatDate(dateStr: string): string {
    return formatDatePaiement(dateStr);
  }

  getStatutBadgeClass(statut: StatutPaiement): string {
    return this.statutBadgeClasses[statut];
  }

  getStatutLabel(statut: StatutPaiement): string {
    return this.statutLabels[statut];
  }

  calculerPourcentagePaye(paiement: PaiementResponseDto): number {
    const montantPaye = paiement.montantDejaPayeAvant + paiement.montantPaiement;
    return (montantPaye / paiement.montantTotalReservation) * 100;
  }
}
