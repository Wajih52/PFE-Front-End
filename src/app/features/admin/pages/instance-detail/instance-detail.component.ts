// src/app/features/admin/pages/instance-detail/instance-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
 * Composant de détails d'une instance
 * Sprint 3 : Gestion des produits et du stock
 */
@Component({
  selector: 'app-instance-detail',
  standalone: true,
  imports: [CommonModule, MenuNavigationComponent],
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.scss']
})
export class InstanceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instanceService = inject(InstanceProduitService);
  private confirmationService = inject(ConfirmationService);
  private notificationService = inject(NotificationService)

  // Données
  instance: InstanceProduitResponse | null = null;
  instanceId: number | null = null;

  // États
  isLoading = false;
  errorMessage = '';

  // Enums pour le template
  StatutInstance = StatutInstance;
  StatutInstanceLabels = StatutInstanceLabels;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.instanceId = +id;
      this.loadInstance();
    } else {
      this.notificationService.error('ID d\'instance invalide');
    }
  }

  /**
   * Charge les détails de l'instance
   */
  loadInstance(): void {
    if (!this.instanceId) return;

    this.isLoading = true;
    this.instanceService.getInstanceById(this.instanceId).subscribe({
      next: (instance) => {
        this.instance = instance;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'instance:', error);
        this.notificationService.error('Instance introuvable');
        this.isLoading = false;
      }
    });
  }

  /**
   * Navigation vers l'édition
   */
  goToEdit(): void {
    if (this.instance) {
      this.router.navigate(['/admin/instances/edit', this.instance.idInstance]);
    }
  }

  /**
   * Retour à la liste
   */
  goBack(): void {
    if (this.instance) {
      this.router.navigate(['/admin/instances'], {
        queryParams: { idProduit: this.instance.idProduit }
      });
    } else {
      this.router.navigate(['/admin/instances']);
    }
  }

  /**
   * Navigation vers le produit parent
   */
  goToProduct(): void {
    if (this.instance) {
      this.router.navigate(['/admin/produits', this.instance.idProduit]);
    }
  }

  /**
   * Changement de statut
   */
  async changerStatut(nouveauStatut: StatutInstance): Promise<void> {
    if (!this.instance) return;

    const message = `Changer le statut vers "${StatutInstanceLabels[nouveauStatut]}" ?`;

    const confirmed = await this.confirmationService.confirm({
      title: ' Changement Statut',
      message: message,
      confirmText: 'Changer',
      type: 'warning'
    });

    if (!confirmed) return;

      if ( confirmed && this.instance) {
        this.instanceService.changerStatut(this.instance.idInstance, nouveauStatut).subscribe({
          next: (updated) => {
            this.instance = updated;
            this.notificationService.success('Statut modifié avec succès');
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.notificationService.error('Erreur lors de la modification du statut');
          }
        });
      }

  }

  /**
   * Suppression de l'instance
   */
 async deleteInstance(): Promise<void> {
    if (!this.instance) return;

    const message = `⚠️ Êtes-vous sûr de vouloir supprimer l'instance ${this.instance.numeroSerie} ?\n\nCette action est irréversible.`;
    const confirmed = await this.confirmationService.confirm({
      title: '⚠️ Suppression Instance',
      message: message,
      confirmText: 'Supprimer',
      type: 'danger'
    });

      if (confirmed && this.instance) {
        this.instanceService.supprimerInstance(this.instance.idInstance).subscribe({
          next: () => {
            this.notificationService.info('Instance supprimée avec succès');
            this.goBack();
          },
          error: (error) => {
            console.error('Erreur:', error);
            this.notificationService.error(' Erreur lors de la suppression');
          }
        });
      }

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
      [StatutInstance.PERDU]: 'status-perdu'
    };
    return classes[statut] || '';
  }

  /**
   * Formatte une date
   */
  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Formatte une date et heure
   */
  formatDateTime(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
