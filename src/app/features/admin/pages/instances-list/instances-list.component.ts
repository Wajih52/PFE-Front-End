// src/app/features/admin/pages/instances-list/instances-list.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InstanceProduitService } from '../../../../services/instance-produit.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import {
  InstanceProduitResponse,
  StatutInstance,
  StatutInstanceLabels
} from '../../../../core/models';
import { MenuNavigationComponent } from '../menu-navigation/menu-navigation.component';
import {NotificationService} from '../../../../services/notification.service';

/**
 * Composant de gestion des instances de produits
 * Permet de gérer les instances individuelles des produits avec référence
 */
@Component({
  selector: 'app-instances-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instances-list.component.html',
  styleUrls: ['./instances-list.component.scss']
})
export class InstancesListComponent implements OnInit {
  private instanceService = inject(InstanceProduitService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService=inject(NotificationService)

  // Données
  allInstances: InstanceProduitResponse[] = [];
  filteredInstances: InstanceProduitResponse[] = [];
  paginatedInstances: InstanceProduitResponse[] = [];
  selectedInstance: InstanceProduitResponse | null = null;

  // Paramètres URL (si vient d'un produit spécifique)
  idProduitFilter: number | null = null;
  nomProduitFilter: string | null = null;

  // Statistiques
  stats = {
    total: 0,
    disponibles: 0,
    reserves: 0,
    enMaintenance: 0,
    horsService: 0
  };

  // Recherche et filtres
  searchTerm = '';
  filterStatut: StatutInstance | '' = '';
  filterProduit = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Tri
  sortColumn: keyof InstanceProduitResponse = 'numeroSerie';
  sortDirection: 'asc' | 'desc' = 'asc';

  // États
  isLoading = false;
  errorMessage = '';
  showMaintenanceModal = false;
  showRetourMaintenanceModal = false;
  instanceForMaintenance: InstanceProduitResponse | null = null;
  instanceForRetourMaintenance : InstanceProduitResponse |null = null;
  // Enums pour le template
  StatutInstance = StatutInstance;
  StatutInstanceLabels = StatutInstanceLabels;
  statutsList = Object.values(StatutInstance);
  // Liste filtrée pour le dropdown
  statutsFiltresDropdown = [
    StatutInstance.DISPONIBLE,
    StatutInstance.HORS_SERVICE,
    StatutInstance.PERDU
  ];

  // Données du formulaire de maintenance
  maintenanceData = {
    motif: ''
  };
  // Données du formulaire de Retour maintenance
  retourMaintenanceData = {
    dateProchaineMaintenance: ''
  };

  ngOnInit(): void {
    // Récupérer l'ID du produit si présent dans les paramètres
    this.route.queryParams.subscribe(params => {
      if (params['idProduit']) {
        this.idProduitFilter = +params['idProduit'];
        this.nomProduitFilter = params['nomProduit'] || null;
      }
      this.loadInstances();
    });
  }

  /**
   * Charge les instances depuis le backend
   */
  loadInstances(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let observable;

    if (this.idProduitFilter) {
      // Charger uniquement les instances du produit spécifique
      observable = this.instanceService.getInstancesByProduit(this.idProduitFilter);
    } else {
      // Charger toutes les instances
      observable = this.instanceService.getInstances();
    }

    observable.subscribe({
      next: (instances) => {
        this.allInstances = instances;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des instances:', error);
        this.errorMessage = 'Erreur lors du chargement des instances';
        this.isLoading = false;
      }
    });
  }

  /**
   * Calcule les statistiques
   */
  calculateStats(): void {
    this.stats = {
      total: this.allInstances.length,
      disponibles: this.allInstances.filter(i => i.statut === StatutInstance.DISPONIBLE).length,
      reserves: this.allInstances.filter(i => i.statut === StatutInstance.RESERVE).length,
      enMaintenance: this.allInstances.filter(i => i.statut === StatutInstance.EN_MAINTENANCE).length,
      horsService: this.allInstances.filter(i => i.statut === StatutInstance.HORS_SERVICE).length
    };
  }

  /**
   * Applique les filtres et la recherche
   */
  applyFilters(): void {
    let filtered = [...this.allInstances];

    // Filtre de recherche
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(instance =>
        instance.numeroSerie.toLowerCase().includes(search) ||
        instance.nomProduit.toLowerCase().includes(search) ||
        instance.observation?.toLowerCase().includes(search)
      );
    }

    // Filtre par statut
    if (this.filterStatut) {
      filtered = filtered.filter(i => i.statut === this.filterStatut);
    }

    // Filtre par produit (si recherche par nom)
    if (this.filterProduit.trim()) {
      const search = this.filterProduit.toLowerCase();
      filtered = filtered.filter(i =>
        i.nomProduit.toLowerCase().includes(search)
      );
    }

    this.filteredInstances = filtered;
    this.sortInstances();
    this.updatePagination();
  }

  /**
   * Trie les instances
   */
  sortInstances(): void {
    this.filteredInstances.sort((a, b) => {
      let aValue = a[this.sortColumn];
      let bValue = b[this.sortColumn];

      // Gestion des valeurs null/undefined
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Conversion en string pour comparaison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      const comparison = aStr.localeCompare(bStr);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Change la colonne de tri
   */
  sortBy(column: keyof InstanceProduitResponse): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortInstances();
    this.updatePagination();
  }

  /**
   * Met à jour la pagination
   */
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredInstances.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInstances = this.filteredInstances.slice(startIndex, endIndex);
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.filterStatut = '';
    this.filterProduit = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  /**
   * Navigation vers le formulaire de création
   */
  goToCreate(): void {
    if (this.idProduitFilter) {
      this.router.navigate(['/admin/instances/new'], {
        queryParams: { idProduit: this.idProduitFilter }
      });
    } else {
      this.router.navigate(['/admin/instances/new']);
    }
  }

  /**
   * Navigation vers le formulaire d'édition
   */
  goToEdit(instance: InstanceProduitResponse): void {
    this.router.navigate(['/admin/instances/edit', instance.idInstance]);
  }

  /**
   * Navigation vers les détails
   */
  goToDetails(instance: InstanceProduitResponse): void {
    this.router.navigate(['/admin/instances', instance.idInstance]);
  }

  /**
   * Retour à la liste des produits
   */
  goToProducts(): void {
    this.router.navigate(['/admin/produits']);
  }

  /**
   * Changement rapide de statut
   */
 async changerStatut(instance: InstanceProduitResponse, nouveauStatut: StatutInstance): Promise<void> {
    const message = `Êtes-vous sûr de vouloir changer le statut de l'instance ${instance.numeroSerie} vers "${StatutInstanceLabels[nouveauStatut]}" ?`;

    const confirmed = await this.confirmationService.confirm({
      title: ' Changement Statut',
      message: message,
      confirmText: 'Changer',
      type: 'warning'
    });

    if (!confirmed) return ;

        this.instanceService.changerStatut(instance.idInstance, nouveauStatut).subscribe({
          next: (updated) => {
            // Mettre à jour l'instance dans la liste
            const index = this.allInstances.findIndex(i => i.idInstance === updated.idInstance);
            if (index !== -1) {
              this.allInstances[index] = updated;
            }
            this.calculateStats();
            this.applyFilters();
            this.notificationService.success('Statut modifié avec succès');
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.errorMessage = error.error?.message || 'Erreur lors de la modification';
            setTimeout(() => this.errorMessage = '', 4000);
          }
        });


  }

  /**
   * Ouvre le modal de maintenance
   */
  openMaintenanceModal(instance: InstanceProduitResponse): void {
    this.instanceForMaintenance = instance;
    this.showMaintenanceModal = true;
  }

  /**
   * Ferme le modal de maintenance
   */
  closeMaintenanceModal(): void {
    this.showMaintenanceModal = false;
    this.instanceForMaintenance = null;
    this.maintenanceData = {
      motif: ''
    };
  }

  /**
   * Ouvre le modal de retour maintenance
   */
  openRetourMaintenanceModal(instance: InstanceProduitResponse): void {
    this.instanceForRetourMaintenance = instance;
    this.showRetourMaintenanceModal = true;
  }


  /**
   * Ferme le modal de Retour maintenance
   */
  closeRetourMaintenanceModal(): void {
    this.showRetourMaintenanceModal = false;
    this.instanceForRetourMaintenance = null;
    this.retourMaintenanceData = {
      dateProchaineMaintenance: ''
    };
  }

  /**
   * Envoie en maintenance
   */
 envoyerEnMaintenance(motif: string): void {
    if (!this.instanceForMaintenance) return;

    this.instanceService.envoyerEnMaintenance(this.instanceForMaintenance.idInstance, motif)
      .subscribe({
      next: (updated) => {
        const index = this.allInstances.findIndex(i => i.idInstance === updated.idInstance);
        if (index !== -1) {
          this.allInstances[index] = updated;
        }
        this.calculateStats();
        this.applyFilters();
        this.closeMaintenanceModal();
        this.notificationService.info('Instance envoyée en maintenance');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.notificationService.error('Erreur lors de l\'envoi en maintenance');
        this.closeMaintenanceModal()
      }
    });
  }
//vérification de la date
  isDateAfterToday(dateString: string): boolean {
    if (!dateString) return false;

    const today = new Date().toISOString().split('T')[0]; // "2024-01-15"
    return dateString > today;
  }
  /**
   * Retour de maintenance
   */
async  retourDeMaintenance(): Promise<void> {
    // Vérifier que l'instance n'est pas null
    if (!this.instanceForRetourMaintenance) {
      this.notificationService.error('Aucune instance sélectionnée');
      return;
    }
    if (!this.isDateAfterToday(this.retourMaintenanceData.dateProchaineMaintenance)) {
      this.notificationService.error('La date doit être supérieure au date d\'aujourd\'hui');
      return;
    }
    const confirmed = await this.confirmationService.confirm({
      title: 'Retour De Maintenance ',
      message: `L'instance ${this.instanceForRetourMaintenance.numeroSerie} est-elle prête à retourner en service ?`,
      confirmText: 'OUI',
      type: 'warning'
    });

      if (!confirmed) return ;

        this.instanceService.retournerDeMaintenance
        (this.instanceForRetourMaintenance.idInstance,this.retourMaintenanceData.dateProchaineMaintenance)
          .subscribe({
          next: (updated) => {
            const index = this.allInstances.findIndex(i => i.idInstance === updated.idInstance);
            if (index !== -1) {
              this.allInstances[index] = updated;
            }
            this.calculateStats();
            this.applyFilters();
            this.closeRetourMaintenanceModal()
            this.notificationService.success('Instance de retour de maintenance');
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.notificationService.error('Erreur lors du retour de maintenance');
            this.closeRetourMaintenanceModal()
          }
        });
  }

  /**
   * Suppression d'une instance
   */
  async deleteInstance(instance: InstanceProduitResponse): Promise<void> {
    const message = `Êtes-vous sûr de vouloir supprimer l'instance ${instance.numeroSerie} ?\n\nCette action est irréversible.`;

    const confirmed = await this.confirmationService.confirm({
      title: '⚠️ Suppression Instance',
      message: message,
      confirmText: 'Supprimer',
      type: 'danger'
    });

   if (!confirmed) return ;


        this.instanceService.supprimerInstance(instance.idInstance).subscribe({
          next: () => {
            this.allInstances = this.allInstances.filter(i => i.idInstance !== instance.idInstance);
            this.calculateStats();
            this.applyFilters();
            this.notificationService.info('Instance supprimée avec succès');
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.notificationService.error('Erreur lors de la suppression');
          }
        });

  }

  /**
   * Naviguer vers l'historique des mouvements d'une instance
   */
  goToHistoriqueInstance(instance: InstanceProduitResponse): void {
    this.router.navigate(['/admin/instances/historique', instance.numeroSerie]);
  }
  /**
   * Obtient la classe CSS selon le statut
   */
  getStatutClass(statut: StatutInstance): string {
    const classes: Record<StatutInstance, string> = {
      [StatutInstance.DISPONIBLE]: 'status-disponible',
      [StatutInstance.RESERVE]: 'status-reserve',
      [StatutInstance.EN_LIVRAISON]: 'status-livraison',
      [StatutInstance.EN_RETOUR]: 'status-retour',
      [StatutInstance.EN_MAINTENANCE]: 'status-maintenance',
      [StatutInstance.HORS_SERVICE]: 'status-hors-service',
      [StatutInstance.PERDU]: 'status-perdu',
      [StatutInstance.EN_UTILISATION]:'status-utilisation'
    };
    return classes[statut] || '';
  }

  /**
   * Change la page
   */
  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  /**
   * Navigation des pages
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  /**
   * Change le nombre d'éléments par page
   */
  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }
}
