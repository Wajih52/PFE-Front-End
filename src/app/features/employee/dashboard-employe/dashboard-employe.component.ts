// src/app/features/employee/dashboard-employe/dashboard-employe.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LivraisonService } from '../../../services/livraison.service';
import { PointageService } from '../../../services/pointage.service';
import { NotificationService as NotifService } from '../../../services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LivraisonResponseDto,
  StatutLivraisonLabels,
  StatutLivraisonColors
} from '../../../core/models/livraison.model';
import { PointageResponse } from '../../../core/models/pointage.model';
import { NotificationResponse } from '../../../core/models/notification.model';
import {NotificationPersistantService} from '../../../services/notification-persistant.service';
const StatutLivraison = {
  NOT_TODAY: 'NOT_TODAY' ,
  EN_ATTENTE: 'EN_ATTENTE' ,
  EN_COURS: 'EN_COURS' ,
  LIVREE: 'LIVREE' ,
  RETOUR: 'RETOUR' ,
  RETOUR_PARTIEL: 'RETOUR_PARTIEL' ,
  RETOURNEE: 'RETOURNEE',
  ANNULEE: 'ANNULEE'
};
type StatutLivraisonn =
  |'NOT_TODAY'
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'LIVREE'
  |'RETOUR'
  |'RETOUR_PARTIEL'
  | 'RETOURNEE'
  | 'ANNULEE';

/**
 * Dashboard simplifié pour les employés
 * Affiche : livraisons du jour, prochaines livraisons, pointage, notifications
 */
@Component({
  selector: 'app-dashboard-employe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-employe.component.html',
  styleUrls: ['./dashboard-employe.component.scss']
})
export class DashboardEmployeComponent implements OnInit {
  private livraisonService = inject(LivraisonService);
  private pointageService = inject(PointageService);
  private notifService = inject(NotificationPersistantService);
  private authService = inject(AuthService);

  // Signals
  mesLivraisons = signal<LivraisonResponseDto[]>([]);
  pointageDuJour = signal<PointageResponse | null>(null);
  notifications = signal<NotificationResponse[]>([]);
  isLoading = signal(true);
  currentUser = computed(() => this.authService.currentUser$);

  // Computed
  livraisonsAujourdhui = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.mesLivraisons().filter(liv =>
      liv.dateLivraison === today &&
      liv.statutLivraison !== StatutLivraison.LIVREE &&
      liv.statutLivraison !== StatutLivraison.ANNULEE
    );
  });

  prochainesLivraisons = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.mesLivraisons()
      .filter(liv =>
        liv.dateLivraison > today &&
        liv.statutLivraison !== StatutLivraison.ANNULEE
      )
      .sort((a, b) => a.dateLivraison.localeCompare(b.dateLivraison))
      .slice(0, 5);
  });

  notificationsRecentes = computed(() => {
    return this.notifications().slice(0, 5);
  });

  // Helpers
  readonly StatutLivraisonLabels = StatutLivraisonLabels;
  readonly StatutLivraisonColors = StatutLivraisonColors;

  ngOnInit(): void {
    this.chargerDonnees();
  }

  private async chargerDonnees(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Récupérer l'ID de l'utilisateur connecté
      const user = this.authService.getCurrentUser();
      if (!user?.idUtilisateur) {
        console.error('Utilisateur non connecté');
        this.isLoading.set(false);
        return;
      }

      // Charger les livraisons affectées à cet employé
      this.livraisonService.getAffectationsByEmploye(user.idUtilisateur).subscribe({
        next: (affectations) => {
          // Extraire les livraisons des affectations
          const livraisonIds = affectations.map(aff => aff.idLivraison);

          // Charger toutes les livraisons et filtrer
          this.livraisonService.getAllLivraisons().subscribe({
            next: (livraisons) => {
              const mesLivs = livraisons.filter(liv =>
                livraisonIds.includes(liv.idLivraison)
              );
              this.mesLivraisons.set(mesLivs);
            },
            error: (err) => console.error('Erreur chargement livraisons:', err)
          });
        },
        error: (err) => console.error('Erreur chargement affectations:', err)
      });

      // Charger le pointage du jour
      this.pointageService.getMonPointageDuJour().subscribe({
        next: (pointage) => this.pointageDuJour.set(pointage),
        error: (err) => console.error('Erreur chargement pointage:', err)
      });

      // Charger les notifications
      this.notifService.getNotifications().subscribe({
        next: (notifs) => this.notifications.set(notifs),
        error: (err) => console.error('Erreur chargement notifications:', err)
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Méthodes d'affichage
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  formatHeure(heure: string): string {
    return heure.substring(0, 5); // HH:mm
  }

  getStatutColor(statut: StatutLivraisonn): string {
    return StatutLivraisonColors[statut] || '#6c757d';
  }

  getStatutLabel(statut: StatutLivraisonn): string {
    return StatutLivraisonLabels[statut] || statut;
  }
}
