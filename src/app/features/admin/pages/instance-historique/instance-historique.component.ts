// src/app/features/admin/pages/instance-historique/instance-historique.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InstanceProduitService } from '../../../../services/instance-produit.service';
import {
  MouvementStockResponse, TypeMouvement,
  TypeMouvementLabels
} from '../../../../core/models';


@Component({
  selector: 'app-instance-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-historique.component.html',
  styleUrls: ['./instance-historique.component.scss']
})
export class InstanceHistoriqueComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instanceService = inject(InstanceProduitService);

  numeroSerie: string = '';
  mouvements: MouvementStockResponse[] = [];
  isLoading = true;
  errorMessage = '';

  readonly TypeMouvementLabels = TypeMouvementLabels;

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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'historique';
        this.isLoading = false;
      }
    });
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
