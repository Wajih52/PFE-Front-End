// src/app/features/admin/pages/historique-mouvement/historique-mouvement.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../../../services/produit.service';
import {
  MouvementStockResponse,
  TypeMouvement,
  TypeMouvementLabels,
  ProduitResponse
} from '../../../../core/models';


@Component({
  selector: 'app-historique-mouvement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historique-mouvement.component.html',
  styleUrls: ['./historique-mouvement.component.scss']
})
export class HistoriqueMouvementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produitService = inject(ProduitService);

  // Données
  idProduit!: number;
  produit: ProduitResponse | null = null;
  allMouvements: MouvementStockResponse[] = [];
  filteredMouvements: MouvementStockResponse[] = [];
  paginatedMouvements: MouvementStockResponse[] = [];

  // Filtres
  filterType: TypeMouvement | '' = '';
  filterDateDebut = '';
  filterDateFin = '';
  filterUtilisateur = '';
  searchTerm = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 15;
  totalPages = 1;

  // Statistiques
  stats = {
    totalMouvements: 0,
    totalEntrees: 0,
    totalSorties: 0,
    dernierMouvement: null as Date | null
  };

  // UI
  isLoading = true;
  errorMessage = '';

  // Enums pour le template
  readonly TypeMouvement = TypeMouvement;
  readonly TypeMouvementLabels = TypeMouvementLabels;
  readonly typesList = Object.values(TypeMouvement);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idProduit = +params['id'];
      this.loadProduit();
      this.loadHistorique();
    });
  }

  loadProduit(): void {
    this.produitService.getProduitById(this.idProduit).subscribe({
      next: (data) => {
        this.produit = data;
      },
      error: (error) => {
        console.error('Erreur chargement produit:', error);
        this.errorMessage = 'Produit introuvable';
      }
    });
  }

  loadHistorique(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getHistoriqueMouvements(this.idProduit).subscribe({
      next: (data) => {
        this.allMouvements = data;
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'historique';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allMouvements];

    if (this.filterType) {
      filtered = filtered.filter(m => m.typeMouvement === this.filterType);
    }

    if (this.filterDateDebut) {
      const dateDebut = new Date(this.filterDateDebut);
      filtered = filtered.filter(m => new Date(m.dateMouvement) >= dateDebut);
    }

    if (this.filterDateFin) {
      const dateFin = new Date(this.filterDateFin);
      dateFin.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.dateMouvement) <= dateFin);
    }

    if (this.filterUtilisateur) {
      filtered = filtered.filter(m =>
        m.effectuePar?.toLowerCase().includes(this.filterUtilisateur.toLowerCase())
      );
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.motif?.toLowerCase().includes(term) ||
        m.numeroSerie?.toLowerCase().includes(term) ||
        m.effectuePar?.toLowerCase().includes(term)
      );
    }

    this.filteredMouvements = filtered;
    this.totalPages = Math.ceil(this.filteredMouvements.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updatePagination();
  }

  resetFilters(): void {
    this.filterType = '';
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.filterUtilisateur = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  calculateStats(): void {
    this.stats.totalMouvements = this.allMouvements.length;

    const typesEntrees = [
      TypeMouvement.AJOUT_STOCK,
      TypeMouvement.AJOUT_INSTANCE,
      TypeMouvement.RETOUR_MAINTENANCE,
      TypeMouvement.RETOUR
    ];

    const typesSorties = [
      TypeMouvement.RETRAIT_STOCK,
      TypeMouvement.SUPPRESSION_INSTANCE,
      TypeMouvement.MAINTENANCE,
      TypeMouvement.PRODUIT_ENDOMMAGE,
      TypeMouvement.LIVRAISON
    ];

    this.stats.totalEntrees = this.allMouvements
      .filter(m => typesEntrees.includes(m.typeMouvement))
      .reduce((sum, m) => sum + m.quantite, 0);

    this.stats.totalSorties = this.allMouvements
      .filter(m => typesSorties.includes(m.typeMouvement))
      .reduce((sum, m) => sum + m.quantite, 0);

    if (this.allMouvements.length > 0) {
      this.stats.dernierMouvement = new Date(this.allMouvements[0].dateMouvement);
    }
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMouvements = this.filteredMouvements.slice(start, end);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  isEntree(type: TypeMouvement): boolean {
    return [
      TypeMouvement.AJOUT_STOCK,
      TypeMouvement.AJOUT_INSTANCE,
      TypeMouvement.RETOUR_MAINTENANCE,
      TypeMouvement.RETOUR,
      TypeMouvement.ANNULATION_RESERVATION
    ].includes(type);
  }

  getMouvementClass(type: TypeMouvement): string {
    if (this.isEntree(type)) {
      return 'entree';
    } else if (type === TypeMouvement.CORRECTION_STOCK) {
      return 'correction';
    } else {
      return 'sortie';
    }
  }

  getMouvementIcon(type: TypeMouvement): string {
    const icons: Record<TypeMouvement, string> = {
      [TypeMouvement.CREATION]: '✨',        // Création produit
      [TypeMouvement.AJOUT_STOCK]: '📦',     // Ajout stock
      [TypeMouvement.ENTREE_STOCK]: '📥',    // Entrée stock
      [TypeMouvement.RETRAIT_STOCK]: '📤',   // Retrait stock
      [TypeMouvement.CORRECTION_STOCK]: '🔄', // Correction stock

      [TypeMouvement.AJOUT_INSTANCE]: '🆕',  // Ajout instance
      [TypeMouvement.SUPPRESSION_INSTANCE]: '🗑️', // Suppression instance

      [TypeMouvement.RESERVATION]: '📅',     // Réservation
      [TypeMouvement.ANNULATION_RESERVATION]: '❌', // Annulation réservation

      [TypeMouvement.MAINTENANCE]: '🔧',     // Maintenance
      [TypeMouvement.RETOUR_MAINTENANCE]: '✅', // Retour maintenance

      [TypeMouvement.LIVRAISON]: '🚚',       // Livraison
      [TypeMouvement.RETOUR]: '↩️',          // Retour

      [TypeMouvement.PRODUIT_ENDOMMAGE]: '⚠️', // Produit endommagé

      [TypeMouvement.REACTIVATION]: '🔓',    // Réactivation
      [TypeMouvement.DESACTIVATION]: '🔒'    // Désactivation
    };
    return icons[type] || '📋'; // Icône par défaut
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  exportToCSV(): void {
    const headers = [
      'Date',
      'Type',
      'Quantité',
      'Qté Avant',
      'Qté Après',
      'Motif',
      'Utilisateur',
      'Instance',
      'Réservation'
    ];

    const rows = this.filteredMouvements.map(m => [
      this.formatDate(m.dateMouvement),
      TypeMouvementLabels[m.typeMouvement],
      m.quantite.toString(),
      m.quantiteAvant.toString(),
      m.quantiteApres.toString(),
      m.motif || '',
      m.effectuePar || '',
      m.numeroSerie || '',
      m.idReservation?.toString() || ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique_${this.produit?.codeProduit}_${new Date().getTime()}.csv`;
    link.click();
  }

  goBack(): void {
    this.router.navigate(['/admin/produits']);
  }
}
