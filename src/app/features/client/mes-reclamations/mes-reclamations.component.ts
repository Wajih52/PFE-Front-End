// mes-reclamations.component.ts - SANS BOOTSTRAP + TRI
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../services/reclamation.service';
import { ReclamationResponse } from '../../../core/models/reclamation.model';
import {
  StatutReclamation,
  TypeReclamation,
  PrioriteReclamation,
  StatutReclamationLabels,
  TypeReclamationLabels,
  PrioriteReclamationLabels
} from '../../../core/models/reclamation.enums';
import {Router} from '@angular/router';

type SortField = 'date' | 'statut' | 'type' | 'priorite';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-mes-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-reclamations.component.html',
  styleUrl: './mes-reclamations.component.scss'
})
export class MesReclamationsComponent implements OnInit {
  private reclamationService = inject(ReclamationService);
  private router = inject(Router);

  // Données
  reclamations = signal<ReclamationResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Tri
  sortField = signal<SortField>('date');
  sortDirection = signal<SortDirection>('desc');

  // Labels
  statutLabels = StatutReclamationLabels;
  typeLabels = TypeReclamationLabels;
  prioriteLabels = PrioriteReclamationLabels;

  // Réclamations triées (computed)
  sortedReclamations = computed(() => {
    const recs = [...this.reclamations()];
    const field = this.sortField();
    const direction = this.sortDirection();

    return recs.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case 'date':
          comparison = new Date(a.dateReclamation).getTime() - new Date(b.dateReclamation).getTime();
          break;
        case 'statut':
          comparison = a.statutReclamation.localeCompare(b.statutReclamation);
          break;
        case 'type':
          comparison = a.typeReclamation.localeCompare(b.typeReclamation);
          break;
        case 'priorite':
          const prioriteOrder = { BASSE: 1, MOYENNE: 2, HAUTE: 3, URGENTE: 4 };
          comparison = prioriteOrder[a.prioriteReclamation] - prioriteOrder[b.prioriteReclamation];
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  });

  ngOnInit(): void {
    this.loadReclamations();
  }

  nouvelleReclamation(): void {
    this.router.navigate(['reclamations/nouvelle-reclamation']);
  }

  /**
   * Charger les réclamations
   */
  loadReclamations(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.reclamationService.getMesReclamations().subscribe({
      next: (data) => {
        this.reclamations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des réclamations');
        this.isLoading.set(false);
        console.error('Erreur:', err);
      }
    });
  }

  /**
   * Changer le tri
   */
  changeSort(field: SortField): void {
    if (this.sortField() === field) {
      // Inverser la direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, direction par défaut
      this.sortField.set(field);
      this.sortDirection.set(field === 'date' ? 'desc' : 'asc');
    }
  }

  /**
   * Obtenir l'icône de tri
   */
  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return '↕️';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Obtenir la classe CSS pour le statut
   */
  getStatutClass(statut: StatutReclamation): string {
    const classes: Record<StatutReclamation, string> = {
      [StatutReclamation.EN_ATTENTE]: 'badge-warning',
      [StatutReclamation.EN_COURS]: 'badge-info',
      [StatutReclamation.RESOLU]: 'badge-success',
      [StatutReclamation.REJETE]: 'badge-danger',
      [StatutReclamation.FERME]: 'badge-secondary'
    };
    return classes[statut] || 'badge-secondary';
  }

  /**
   * Obtenir la classe CSS pour la priorité
   */
  getPrioriteClass(priorite: PrioriteReclamation): string {
    const classes: Record<PrioriteReclamation, string> = {
      [PrioriteReclamation.BASSE]: 'badge-secondary',
      [PrioriteReclamation.MOYENNE]: 'badge-info',
      [PrioriteReclamation.HAUTE]: 'badge-warning',
      [PrioriteReclamation.URGENTE]: 'badge-danger'
    };
    return classes[priorite] || 'badge-secondary';
  }
}
