// src/app/features/employee/pointage-employee/pointage-employee.component.ts

import {Component, OnInit, OnDestroy, signal, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PointageService } from '../../../services/pointage.service';
import { PointageResponse, StatistiquesPointage } from '../../../core/models/pointage.model';
import { StatutPointageLabels, StatutPointageColors, StatutPointageIcons } from '../../../core/models/pointage.enums';
import {NotificationService} from '../../../services/notification.service';
import {UserResponse} from '../../../core/models';
import {UtilisateurService} from '../../../services/utilisateur.service';

@Component({
  selector: 'app-pointage-employee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pointage-employee.component.html',
  styleUrl: './pointage-employee.component.scss'
})
export class PointageEmployeeComponent implements OnInit, OnDestroy {

  private notificationService=inject(NotificationService)


  // Signals
  pointageDuJour = signal<PointageResponse | null>(null);
  statistiques = signal<StatistiquesPointage | null>(null);
  historique = signal<PointageResponse[]>([]);
  isLoading = signal(false);
  currentTime = signal(new Date());

  // Computed
  heureActuelle = computed(() => {
    const time = this.currentTime();
    return time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  dateActuelle = computed(() => {
    const time = this.currentTime();
    return time.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  aPointerArrivee = computed(() => {
    const pointage = this.pointageDuJour();
    return pointage === null;
  });

  peutPointerDepart = computed(() => {
    const pointage = this.pointageDuJour();
    return pointage !== null && pointage.heureDebut && !pointage.heureFin;
  });

  private timeInterval: any;

  // Helpers pour l'affichage
  readonly statutLabels = StatutPointageLabels;
  readonly statutColors = StatutPointageColors;
  readonly statutIcons = StatutPointageIcons;

  constructor(private pointageService: PointageService) {}

  ngOnInit(): void {
    this.loadPointageDuJour();
    this.loadStatistiques();
    this.loadHistorique();


    // Mettre à jour l'heure chaque seconde
    this.timeInterval = setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }


  /**
   * Charger le pointage du jour
   */
  loadPointageDuJour(): void {
    this.pointageService.getMonPointageDuJour().subscribe({
      next: (pointage) => {
        this.pointageDuJour.set(pointage);
      },
      error: () => {
        this.pointageDuJour.set(null);
      }
    });
  }

  /**
   * Pointer l'arrivée
   */
  pointerArrivee(): void {
    this.isLoading.set(true);

    this.pointageService.pointerArrivee().subscribe({
      next: (pointage) => {
        this.pointageDuJour.set(pointage);
        this.isLoading.set(false);
        this.showSuccessMessage('Arrivée pointée avec succès !');
      },
      error: (error) => {
        this.isLoading.set(false);
        this.showErrorMessage(error.error?.message || 'Erreur lors du pointage');
      }
    });
  }

  /**
   * Pointer le départ
   */
  pointerDepart(): void {
    this.isLoading.set(true);

    this.pointageService.pointerDepart().subscribe({
      next: (pointage) => {
        this.pointageDuJour.set(pointage);
        this.isLoading.set(false);
        this.showSuccessMessage('Départ pointé avec succès !');
        this.loadStatistiques(); // Recharger les stats
      },
      error: (error) => {
        this.isLoading.set(false);
        this.showErrorMessage(error.error?.message || 'Erreur lors du pointage');
      }
    });
  }

  /**
   * Charger les statistiques du mois en cours
   */
  loadStatistiques(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const dateDebut = this.formatDate(firstDay);
    const dateFin = this.formatDate(lastDay);

    this.pointageService.getMesStatistiques(dateDebut, dateFin).subscribe({
      next: (stats) => {
        this.statistiques.set(stats);
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
      }
    });
  }

  /**
   * Charger l'historique des 30 derniers jours
   */
  loadHistorique(): void {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dateDebut = this.formatDate(thirtyDaysAgo);
    const dateFin = this.formatDate(now);

    this.pointageService.getMesPointages(dateDebut, dateFin).subscribe({
      next: (historique) => {
        this.historique.set(historique);
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
      }
    });
  }

  /**
   * Formater une date en YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatutColor(statut: string): string {
    return this.statutColors[statut as keyof typeof StatutPointageColors] || '#95a5a6';
  }

  /**
   * Obtenir le label du statut
   */
  getStatutLabel(statut: string): string {
    return this.statutLabels[statut as keyof typeof StatutPointageLabels] || statut;
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatutIcon(statut: string): string {
    return this.statutIcons[statut as keyof typeof StatutPointageIcons] || '📌';
  }

  /**
   * Afficher un message de succès
   */
  private showSuccessMessage(message: string): void {
    this.notificationService.success(message,3000)
  }

  /**
   * Afficher un message d'erreur
   */
  private showErrorMessage(message: string): void {
    this.notificationService.error(message,3000)
    console.error('Error:', message);
  }
}
