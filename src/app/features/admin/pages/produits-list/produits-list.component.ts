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
import {NotificationService} from '../../../../services/notification.service';

/**
 * Composant de liste des produits avec recherche, filtres et gestion
 * Sprint 3 : Gestion des produits et du stock
 */
@Component({
  selector: 'app-produits-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits-list.component.html',
  styleUrls: ['./produits-list.component.scss']
})
export class ProduitsListComponent implements OnInit {
  private produitService = inject(ProduitService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

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

  // Modal ajustement stock
  showAjustementModal = false;
  produitAjustement: ProduitResponse | null = null;
  nouvelleQuantite: number = 0;
  motifAjustement: string = '';

  // Filtre par date
  filterDate: string = '';
  minDate: string = '';

  ngOnInit(): void {

    // Date minimale = aujourd'hui
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    this.filterDate = this.minDate; // Par défaut aujourd'hui

    this.loadProduits();
  }

  /**
   * Charger tous les produits
   */
  loadProduits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Si une date est sélectionnée, utiliser l'API avec période
    if (this.filterDate) {
      // Charger les produits disponibles pour cette date
      this.produitService.getCatalogueDisponibleSurPeriode(
        this.filterDate,
        this.filterDate // Même date pour début et fin
      ).subscribe({
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
    } else {
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
   * Appliquer le filtre de date
   */
  onDateFilterChange(): void {
    this.loadProduits();
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
   * Supprimer un produit avec choix: soft delete ou hard delete
   */
  async deleteProduit(produit: ProduitResponse): Promise<void> {
    const typeConfirmed = await this.confirmationService.confirm({
      title: 'Type de suppression',
      message: `
      Produit: ${produit.nomProduit} \n

        Choisissez le type de suppression:\n

          Désactiver : Le produit sera masqué mais conservé dans la base\n
         Supprimer définitivement : ⚠️ Suppression permanente de la base de données\n
    `,
      confirmText: 'Désactiver',
      cancelText: 'Supprimer définitivement',
      type: 'warning'
    });

    if (typeConfirmed) {
      // Soft delete
      this.produitService.supprimerProduit(produit.idProduit).subscribe({
        next: () => {
          this.notificationService.success(`Produit "${produit.nomProduit}" désactivé avec succès`);
          this.loadProduits();
        },
        error: (error) => {
          console.error('Erreur désactivation produit:', error);
          const errorMsg = error.error?.message || error.error || 'Erreur lors de la désactivation';
          this.notificationService.error(errorMsg);
        }
      });
    } else {
      // Hard delete - confirmation supplémentaire
      const hardDeleteConfirmed = await this.confirmationService.confirm({
        title: 'Suppression définitive',
        message: `

         ATTENTION: Cette action est IRRÉVERSIBLE!\n
          Le produit "${produit.nomProduit}" sera supprimé DÉFINITIVEMENT de la base de données.\n
          Toutes les données associées seront perdues.\n
         Êtes-vous absolument sûr?\n

      `,
        confirmText: 'Supprimer ',
        cancelText: 'Annuler',
        type: 'danger'
      });

      if (hardDeleteConfirmed) {
        this.produitService.supprimerProduitDefinitivement(produit.idProduit).subscribe({
          next: (response) => {
            this.notificationService.success(response.message);
            this.loadProduits();
          },
          error: (error) => {
            console.error('Erreur suppression définitive:', error);
            const errorMsg = error.error?.error || error.error?.message || 'Erreur lors de la suppression définitive';
            this.notificationService.error(errorMsg);
          }
        });
      }
    }
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

  /**
   * Ouvrir le modal d'ajustement de stock
   */
  openAjustementModal(produit: ProduitResponse): void {
    if (produit.typeProduit !== TypeProduit.EN_QUANTITE) {
      this.notificationService.warning('L\'ajustement de stock n\'est disponible que pour les produits EN_QUANTITE');
      return;
    }

    this.produitAjustement = produit;
    this.nouvelleQuantite = produit.quantiteDisponible;
    this.motifAjustement = '';
    this.showAjustementModal = true;
  }

  /**
   * Fermer le modal d'ajustement
   */
  closeAjustementModal(): void {
    this.showAjustementModal = false;
    this.produitAjustement = null;
    this.nouvelleQuantite = 0;
    this.motifAjustement = '';
  }

  /**
   * Soumettre l'ajustement de stock
   */
  async submitAjustementStock(): Promise<void> {
    if (!this.produitAjustement) return;

    // Validation
    if (this.nouvelleQuantite < 0) {
      this.notificationService.warning('La quantité ne peut pas être négative');
      return;
    }

    if (!this.motifAjustement.trim()) {
      this.notificationService.warning('Veuillez indiquer un motif pour l\'ajustement');
      return;
    }

    // Confirmation
    const confirmed = await this.confirmationService.confirm({
      title: 'Ajuster le stock',
      message: `
      <div>
        <p><strong>Produit:</strong> ${this.produitAjustement.nomProduit}</p>
        <p><strong>Stock actuel:</strong> ${this.produitAjustement.quantiteDisponible}</p>
        <p><strong>Nouveau stock:</strong> ${this.nouvelleQuantite}</p>
        <p><strong>Différence:</strong> ${this.nouvelleQuantite - this.produitAjustement.quantiteDisponible}</p>
        <p><strong>Motif:</strong> ${this.motifAjustement}</p>
      </div>
    `,
      confirmText: 'Oui, ajuster',
      type: 'info'
    });

    if (!confirmed) return;

    // Appel API
    this.produitService.ajusterStock(
      this.produitAjustement.idProduit,
      this.nouvelleQuantite,
      this.motifAjustement
    ).subscribe({
      next: (data) => {
        this.notificationService.success(`Stock ajusté avec succès pour "${data.nomProduit}"`);
        this.closeAjustementModal();
        this.loadProduits();
      },
      error: (error) => {
        console.error('Erreur ajustement stock:', error);
        const errorMsg = error.error?.message || 'Erreur lors de l\'ajustement du stock';
        this.notificationService.error(errorMsg);
      }
    });
  }

  /**
   * Désactiver un produit (soft delete)
   */
  async desactiverProduit(produit: ProduitResponse): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Désactiver le produit',
      message: `Voulez-vous vraiment désactiver le produit "${produit.nomProduit}" ?<br>Le produit sera masqué mais pourra être réactivé ultérieurement.`,
      confirmText: 'Oui, désactiver',
      type: 'warning'
    });

    if (!confirmed) return;

    this.produitService.supprimerProduit(produit.idProduit).subscribe({
      next: () => {
        this.notificationService.success(`Produit "${produit.nomProduit}" désactivé avec succès`);
        this.loadProduits();
      },
      error: (error) => {
        console.error('Erreur désactivation produit:', error);
        const errorMsg = error.error?.message || 'Erreur lors de la désactivation';
        this.notificationService.error(errorMsg);
      }
    });
  }

  /**
   * Réactiver un produit désactivé
   */
  async reactiverProduit(produit: ProduitResponse): Promise<void> {
    if (produit.typeProduit === TypeProduit.AVEC_REFERENCE) {
      this.notificationService.warning('Pour réactiver un produit avec référence, vous devez réactiver ses instances individuellement');
      this.router.navigate(['/admin/instances'], {
        queryParams: { idProduit: produit.idProduit }
      });
      return;
    }

    // Demander la quantité à réactiver
    const quantiteStr = await this.confirmationService.prompt({
      title: 'Réactiver le produit',
      message: `Quelle quantité souhaitez-vous réactiver pour "${produit.nomProduit}" ?`,
      placeholder: '10',
      inputType: 'number'
    });

    if (!quantiteStr) return;

    const quantite = parseInt(quantiteStr, 10);
    if (isNaN(quantite) || quantite <= 0) {
      this.notificationService.warning('Veuillez saisir une quantité valide');
      return;
    }

    this.produitService.reactiverProduit(produit.idProduit, quantite).subscribe({
      next: (data) => {
        this.notificationService.success(`Produit "${data.nomProduit}" réactivé avec succès (quantité: ${quantite})`);
        this.loadProduits();
      },
      error: (error) => {
        console.error('Erreur réactivation produit:', error);
        const errorMsg = error.error?.message || 'Erreur lors de la réactivation';
        this.notificationService.error(errorMsg);
      }
    });
  }
}
