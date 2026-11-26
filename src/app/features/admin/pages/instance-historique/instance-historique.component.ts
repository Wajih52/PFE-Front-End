// src/app/features/admin/pages/instance-historique/instance-historique.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InstanceProduitService } from '../../../../services/instance-produit.service';
import {
  MouvementStockResponse, TypeMouvement,
  TypeMouvementLabels
} from '../../../../core/models';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'app-instance-historique',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './instance-historique.component.html',
  styleUrls: ['./instance-historique.component.scss']
})
export class InstanceHistoriqueComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instanceService = inject(InstanceProduitService);

  numeroSerie: string = '';
  mouvements: MouvementStockResponse[] = [];
  filteredMouvements: MouvementStockResponse[] = [];
  isLoading = true;
  errorMessage = '';

  // Critères de filtrage
  searchTerm: string = '';
  filterType: TypeMouvement | '' = '';
  filterDateDebut: string = '';
  filterDateFin: string = '';
  filterUtilisateur: string = '';

  readonly TypeMouvementLabels = TypeMouvementLabels;
  typesDisponibles: TypeMouvement[] = [];

  ngOnInit(): void {
    this.numeroSerie = this.route.snapshot.params['numeroSerie'];
    this.loadHistorique();
  }

  loadHistorique(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.instanceService.getHistoriqueMouvementsInstance(this.numeroSerie).subscribe({
      next: (data) => {
        this.mouvements = data;
        // Récupérer uniquement les types de mouvements présents pour cette instance
        this.typesDisponibles = [...new Set(data.map(m => m.typeMouvement))];
        this.applyFilters();
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
    let result = [...this.mouvements];

    // Filtre par type de mouvement
    if (this.filterType) {
      result = result.filter(m => m.typeMouvement === this.filterType);
    }

    // Filtre par date de début
    if (this.filterDateDebut) {
      const debut = new Date(this.filterDateDebut);
      debut.setHours(0, 0, 0, 0);
      result = result.filter(m => new Date(m.dateMouvement) >= debut);
    }

    //Filtre par date de fin
    if (this.filterDateFin) {
      const fin = new Date(this.filterDateFin);
      fin.setHours(23, 59, 59, 999);
      result = result.filter(m => new Date(m.dateMouvement) <= fin);
    }

    //Filtre par utilisateur
    if (this.filterUtilisateur.trim()) {
      const userTerm = this.filterUtilisateur.toLowerCase().trim();
      result = result.filter(m =>
        m.effectuePar?.toLowerCase().includes(userTerm)
      );
    }

    // Recherche globale (motif, référence réservation, utilisateur)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(m =>
        m.motif?.toLowerCase().includes(term) ||
        m.referenceReservation?.toLowerCase().includes(term) ||
        m.effectuePar?.toLowerCase().includes(term)
      );
    }

    this.filteredMouvements = result;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterType = '';
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.filterUtilisateur = '';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.searchTerm ||
      this.filterType ||
      this.filterDateDebut ||
      this.filterDateFin ||
      this.filterUtilisateur
    );
  }

  goBack(): void {
    this.router.navigate(['/admin/instances']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR');
  }


  /**
   * Obtenir l'icône pour un type de mouvement
   */
  getIconForMouvement(type: TypeMouvement): string {
    const icons: Record<TypeMouvement, string> = {
      [TypeMouvement.CREATION]: '✨',        // Création produit
      [TypeMouvement.AJOUT_STOCK]: '📦',     // Ajout stock
      [TypeMouvement.ENTREE_STOCK]: '📥',    // Entrée stock
      [TypeMouvement.RETRAIT_STOCK]: '📤',   // Retrait stock
      [TypeMouvement.CORRECTION_STOCK]: '🔄', // Correction stock


      [TypeMouvement.RESERVATION]: '📅',     // Réservation
      [TypeMouvement.ANNULATION_RESERVATION]: '❌', // Annulation réservation

      [TypeMouvement.MAINTENANCE]: '🔧',     // Maintenance
      [TypeMouvement.RETOUR_MAINTENANCE]: '✅', // Retour maintenance

      [TypeMouvement.LIVRAISON]: '🚚',       // Livraison
      [TypeMouvement.RETOUR]: '↩️',          // Retour

      [TypeMouvement.PRODUIT_ENDOMMAGE]: '⚠️', // Produit endommagé

      [TypeMouvement.REACTIVATION]: '🔓',    // Réactivation
      [TypeMouvement.DESACTIVATION]: '🔒' ,   // Désactivation

      [TypeMouvement.AJOUT_INSTANCE]: '🆕',  // Ajout instance
      [TypeMouvement.SUPPRESSION_INSTANCE]: '🗑️', // Suppression instance

  };
    return icons[type] || '📦';
  }
}
