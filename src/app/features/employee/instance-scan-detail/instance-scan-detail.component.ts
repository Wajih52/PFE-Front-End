import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  InstanceProduitResponse,
  StatutInstance,
  StatutInstanceLabels,
  EtatPhysique,
  EtatPhysiqueLabels
} from '../../../core/models';
import { InstanceProduitService } from '../../../services/instance-produit.service';
import { NotificationService } from '../../../services/notification.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-instance-scan-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-scan-detail.component.html',
  styleUrls: ['./instance-scan-detail.component.scss']
})
export class InstanceScanDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instanceService = inject(InstanceProduitService);
  private notificationService = inject(NotificationService);
  private storageService = inject(StorageService);

  instance: InstanceProduitResponse | null = null;
  isLoading = false;
  errorMessage = '';

  StatutInstance = StatutInstance;
  StatutInstanceLabels = StatutInstanceLabels;
  EtatPhysique = EtatPhysique;
  EtatPhysiqueLabels = EtatPhysiqueLabels;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.errorMessage = 'Code QR invalide.';
      this.notificationService.error('Code QR invalide');
      return;
    }

    this.loadInstanceByQrCode(token);
  }

  loadInstanceByQrCode(token: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.instanceService.getInstanceByQrCode(token).subscribe({
      next: (instance) => {
        const roles = this.storageService.getUserRoles();

        const isAdminOrManager =
          roles.includes('ADMIN') || roles.includes('MANAGER');

        if (isAdminOrManager) {
          this.router.navigate([
            '/admin/instances/historique',
            instance.numeroSerie
          ]);
          return;
        }

        this.instance = instance;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur scan QR:', error);
        this.errorMessage = 'Instance introuvable ou code QR invalide.';
        this.notificationService.error('Instance introuvable ou code QR invalide');
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/employe/livraisons']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatutClass(statut: StatutInstance): string {
    const classes: Record<StatutInstance, string> = {
      [StatutInstance.DISPONIBLE]: 'status-disponible',
      [StatutInstance.EN_ATTENTE]: 'status-attente',
      [StatutInstance.EN_LIVRAISON]: 'status-livraison',
      [StatutInstance.EN_RETOUR]: 'status-retour',
      [StatutInstance.EN_MAINTENANCE]: 'status-maintenance',
      [StatutInstance.HORS_SERVICE]: 'status-hors-service',
      [StatutInstance.PERDU]: 'status-perdu',
      [StatutInstance.EN_UTILISATION]: 'status-utilisation'
    };

    return classes[statut] || '';
  }

  getEtatPhysiqueClass(etat: EtatPhysique): string {
    const classes: Record<EtatPhysique, string> = {
      [EtatPhysique.NEUF]: 'status-neuf',
      [EtatPhysique.BON_ETAT]: 'status-bon-etat',
      [EtatPhysique.ETAT_MOYEN]: 'status-etat-moyen',
      [EtatPhysique.USAGE]: 'status-usage',
      [EtatPhysique.ENDOMMAGE]: 'status-endommage'
    };

    return classes[etat] || '';
  }
}
