// src/app/features/admin/pages/produits-list/produits-list.component.ts (VERSION CORRIGÉE)

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProduitService } from '../../../../services/produit.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import {
  ProduitResponse,
  Categorie,
  TypeProduit,
  CategorieLabels,
  TypeProduitLabels
} from '../../../../core/models';
import {MenuNavigationComponent} from '../menu-navigation/menu-navigation.component';

/**
 * Composant de liste des produits avec recherche, filtres et gestion
 * Sprint 3 : Gestion des produits et du stock
 */
@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuNavigationComponent],
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.scss']
})
export class ProduitsListComponent implements OnInit {
  private produitService = inject(ProduitService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // Données
  allProduits: ProduitResponse[] = [];
  filteredProduits: ProduitResponse[] = [];
  selectedProduit: ProduitResponse | null = null;

  // Statistiques
  stats = {
    total: 0,
    disponibles: 0,
    rupture: 0,
    critique: 0
  };

  // Recherche et filtres
  searchTerm = '';
  filterCategorie: Categorie | '' = '';
  filterType: TypeProduit | '' = '';
  filterStatut: 'disponible' | 'rupture' | 'critique' | '' = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Tri
  sortColumn: keyof ProduitResponse | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // UI
  showDetailsModal = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Enums pour le template
  readonly Categorie = Categorie;
  readonly TypeProduit = TypeProduit;
  readonly CategorieLabels = CategorieLabels;
  readonly TypeProduitLabels = TypeProduitLabels;
  readonly categoriesList = Object.values(Categorie);
  readonly typesList = Object.values(TypeProduit);

  ngOnInit(): void {
    this.loadProduits();
  }

  /**
   * Charger tous les produits
   */
  loadProduits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.produitService.getAllProduits().subscribe({
      next: (data) => {
        this.allProduits = data;
        this.applyFilters();
        this.calculateStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error);
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.isLoading = false;
      }
    });
  }

  /**
   * Calculer les statistiques locales
   */
  calculateStats(): void {
    this.stats.total = this.allProduits.length;
    this.stats.disponibles = this.allProduits.filter(p => p.quantiteDisponible > 0).length;
    this.stats.rupture = this.allProduits.filter(p => p.quantiteDisponible === 0).length;
    this.stats.critique = this.allProduits.filter(p => p.alerteStockCritique).length;
  }

  /**
   * Appliquer les filtres et la recherche
   */
  applyFilters(): void {
    let result = [...this.allProduits];

    // Filtre de recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(p =>
        p.nomProduit.toLowerCase().includes(term) ||
        p.codeProduit.toLowerCase().includes(term) ||
        p.descriptionProduit?.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (this.filterCategorie) {
      result = result.filter(p => p.categorieProduit === this.filterCategorie);
    }

    // Filtre par type
    if (this.filterType) {
      result = result.filter(p => p.typeProduit === this.filterType);
    }

    // Filtre par statut
    if (this.filterStatut === 'disponible') {
      result = result.filter(p => p.quantiteDisponible > 0);
    } else if (this.filterStatut === 'rupture') {
      result = result.filter(p => p.quantiteDisponible === 0);
    } else if (this.filterStatut === 'critique') {
      result = result.filter(p => p.alerteStockCritique);
    }

    this.filteredProduits = result;
    this.totalPages = Math.ceil(this.filteredProduits.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  /**
   * Réinitialiser tous les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.filterCategorie = '';
    this.filterType = '';
    this.filterStatut = '';
    this.applyFilters();
  }

  /**
   * Trier la liste
   */
  sortBy(column: keyof ProduitResponse): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredProduits.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Obtenir les produits de la page courante
   */
  get paginatedProduits(): ProduitResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredProduits.slice(start, end);
  }

  /**
   * Changer de page
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  /**
   * Afficher les détails d'un produit
   */
  showDetails(produit: ProduitResponse): void {
    this.selectedProduit = produit;
    this.showDetailsModal = true;
  }

  /**
   * Fermer le modal de détails
   */
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedProduit = null;
  }

  /**
   * Naviguer vers la création d'un produit
   */
  goToCreate(): void {
    this.router.navigate(['/admin/produits/create']);
  }

  /**
   * Naviguer vers la modification d'un produit
   */
  goToEdit(id: number): void {
    this.router.navigate(['/admin/produits/edit', id]);
  }

  /**
   * Naviguer vers la gestion des instances
   */
  goToInstances(produit: ProduitResponse): void {
    this.router.navigate(['/admin/instances'], {
      queryParams: {
        idProduit: produit.idProduit,
        nomProduit: produit.nomProduit
      }
    });
  }
  /**
   * Naviguer vers l'historique des mouvements
   */
  goToMouvements(id: number): void {
    this.router.navigate(['/admin/produits', id, 'historique']);
  }

  /**
   * Supprimer un produit
   */
  async deleteProduit(produit: ProduitResponse): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Supprimer le produit',
      message: `Voulez-vous vraiment supprimer le produit "${produit.nomProduit}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      type: 'danger'
    });

    if (!confirmed) return;

    this.produitService.supprimerProduit(produit.idProduit).subscribe({
      next: () => {
        this.successMessage = 'Produit supprimé avec succès';
        this.loadProduits();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Erreur suppression produit:', error);
        this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  /**
   * Obtenir la classe CSS pour le statut de stock
   */
  getStockStatusClass(produit: ProduitResponse): string {
    if (produit.quantiteDisponible === 0) return 'stock-rupture';
    if (produit.alerteStockCritique) return 'stock-critique';
    return 'stock-ok';
  }

  /**
   * Obtenir le label du statut de stock
   */
  getStockStatusLabel(produit: ProduitResponse): string {
    if (produit.quantiteDisponible === 0) return 'Rupture';
    if (produit.alerteStockCritique) return 'Critique';
    return 'Disponible';
  }
}
