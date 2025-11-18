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
import { ToastrService } from 'ngx-toastr';
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
  private toastr = inject(ToastrService);

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
  minDate: string = '';

  //  Propriétés pour le filtre de date
  filterDateDebut: string = '';
  filterDateFin: string = '';
  produitsDisponibilite: any[] = [];  // Pour stocker les infos de disponibilité
  isLoadingDisponibilite = false;

//  Propriétés pour le modal de réactivation
  showReactivationModal = false;
  produitReactivation: ProduitResponse | null = null;
  quantiteReactivation = 0;

  ngOnInit(): void {

    // Date minimale = aujourd'hui
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.loadProduits();
  }

  /**
   * Charger tous les produits (sans filtre de date)
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
   * Supprimer un produit avec choix: soft delete ou hard delete
   */
  async deleteProduit(produit: ProduitResponse): Promise<void> {
    const typeConfirmed = await this.confirmationService.confirm({
      title: 'Type de suppression',
      message: `
      <div>
        <p><strong>Produit:</strong> ${produit.nomProduit}</p>
        <p>Choisissez le type de suppression:</p>
        <ul>
          <li><strong>Désactiver</strong>: Le produit sera masqué mais conservé dans la base</li>
          <li><strong>Supprimer définitivement</strong>: ⚠️ Suppression permanente de la base de données</li>
        </ul>
      </div>
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

         <div style="color: #d32f2f;">
          <p><strong>ATTENTION: Cette action est IRRÉVERSIBLE!</strong></p>
          <p>Le produit "${produit.nomProduit}" sera supprimé DÉFINITIVEMENT de la base de données.</p>
          <p>Toutes les données associées seront perdues.</p>
          <p><strong>Êtes-vous absolument sûr?</strong></p>
        </div>
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
        this.notificationService.error(errorMsg,4000);
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
   * ✅ MODIFIÉ: Réactiver un produit avec modal
   */
  async reactiverProduit(): Promise<void> {
    if (!this.produitReactivation) return;

    // Validation
    if (this.produitReactivation.typeProduit === TypeProduit.EN_QUANTITE &&
      this.quantiteReactivation < 0) {
      this.notificationService.warning('La quantité ne peut pas être négative');
      return;
    }

    // Confirmation finale
    const confirmed = await this.confirmationService.confirm({
      title: 'Réactiver le produit',
      message: `<p>Voulez-vous réactiver "${this.produitReactivation.nomProduit}" ?</p>
              ${this.produitReactivation.typeProduit === TypeProduit.EN_QUANTITE ?
        `<p><strong>Quantité initiale:</strong> ${this.quantiteReactivation}</p>` : ''}`,
      confirmText: 'Oui, réactiver',
      type: 'info'
    });

    if (!confirmed) return;

    const idProduit = this.produitReactivation.idProduit;

    this.produitService.reactiverProduit(
      idProduit,
      this.produitReactivation.typeProduit === TypeProduit.EN_QUANTITE ?
        this.quantiteReactivation : 0
    ).subscribe({
      next: () => {
        this.notificationService.success('Produit réactivé avec succès');
        this.closeReactivationModal();
        this.loadProduits();
      },
      error: (error) => {
        console.error('Erreur réactivation:', error);
        this.notificationService.error(error.error?.message || 'Erreur lors de la réactivation');
      }
    });
  }

  /**
   * ✅ NOUVEAU: Ouvrir le modal de réactivation
   */
  openReactivationModal(produit: ProduitResponse): void {
    this.produitReactivation = produit;
    this.quantiteReactivation = produit.quantiteDisponible || 0;
    this.showReactivationModal = true;
  }

  /**
   * ✅ NOUVEAU: Fermer le modal de réactivation
   */
  closeReactivationModal(): void {
    this.showReactivationModal = false;
    this.produitReactivation = null;
    this.quantiteReactivation = 0;
  }


  /**
   * Obtenir la date minimale (aujourd'hui)
   */
  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * ✅ NOUVEAU: Appliquer le filtre de date
   */
  applyDateFilter(): void {
    if (!this.filterDateDebut || !this.filterDateFin) {
      this.toastr.warning('Veuillez sélectionner les deux dates');
      return;
    }

    if (new Date(this.filterDateDebut) > new Date(this.filterDateFin)) {
      this.toastr.warning('La date de début doit être antérieure à la date de fin');
      return;
    }

    this.isLoadingDisponibilite = true;

    this.produitService.getProduitsAvecDisponibilitePourPeriode(
      this.filterDateDebut,
      this.filterDateFin
    ).subscribe({
      next: (data) => {
        this.produitsDisponibilite = data;
        this.applyFilters();  // Réappliquer les autres filtres
        this.isLoadingDisponibilite = false;
        this.toastr.success(
          `Disponibilité calculée pour la période du ${this.formatDate(this.filterDateDebut)} au ${this.formatDate(this.filterDateFin)}`
        );
      },
      error: (error) => {
        console.error('Erreur calcul disponibilité:', error);
        this.toastr.error('Erreur lors du calcul de la disponibilité');
        this.isLoadingDisponibilite = false;
      }
    });
  }

  /**
   * ✅ NOUVEAU: Réinitialiser le filtre de date
   */
  resetDateFilter(): void {
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.produitsDisponibilite = [];
    this.applyFilters();
  }

  /**
   * ✅ NOUVEAU: Obtenir la disponibilité pour un produit
   */
  getDisponibilitePourProduit(idProduit: number): any {
    return this.produitsDisponibilite.find(p => p.idProduit === idProduit);
  }

  /**
   * ✅ MODIFIÉ: Helper pour formatter les dates
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
