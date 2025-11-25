import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../../services/reclamation.service';
import {
  ReclamationResponse,
  TraiterReclamationDto
} from '../../../../core/models/reclamation.model';
import {
  StatutReclamation,
  TypeReclamation,
  PrioriteReclamation,
  StatutReclamationLabels,
  TypeReclamationLabels,
  PrioriteReclamationLabels
} from '../../../../core/models/reclamation.enums';

type SortField = 'date' | 'statut' | 'type' | 'priorite' | 'client';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-gestion-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamations-list.component.html',
  styleUrl: './reclamations-list.component.scss'
})
export class ReclamationsListComponent implements OnInit {
  private reclamationService = inject(ReclamationService);

  // Données
  reclamations = signal<ReclamationResponse[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Filtres
  filtreStatut = signal<StatutReclamation | ''>('');
  filtreType = signal<TypeReclamation | ''>('');
  filtrePriorite = signal<PrioriteReclamation | ''>('');

  // Tri
  sortField = signal<SortField>('date');
  sortDirection = signal<SortDirection>('desc');

  // Modal
  selectedReclamation = signal<ReclamationResponse | null>(null);
  showModal = signal(false);
  isProcessing = signal(false);
  modalData = {
    statutReclamation: StatutReclamation.EN_COURS,
    prioriteReclamation: PrioriteReclamation.MOYENNE,
    reponse: ''
  };

  // Enums
  statutValues = Object.values(StatutReclamation);
  typeValues = Object.values(TypeReclamation);
  prioriteValues = Object.values(PrioriteReclamation);

  // Labels
  statutLabels = StatutReclamationLabels;
  typeLabels = TypeReclamationLabels;
  prioriteLabels = PrioriteReclamationLabels;

  // Réclamations filtrées et triées
  filteredAndSortedReclamations = computed(() => {
    let recs = [...this.reclamations()];

    // Appliquer les filtres
    if (this.filtreStatut()) {
      recs = recs.filter(r => r.statutReclamation === this.filtreStatut());
    }
    if (this.filtreType()) {
      recs = recs.filter(r => r.typeReclamation === this.filtreType());
    }
    if (this.filtrePriorite()) {
      recs = recs.filter(r => r.prioriteReclamation === this.filtrePriorite());
    }

    // Appliquer le tri
    const field = this.sortField();
    const direction = this.sortDirection();

    recs.sort((a, b) => {
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
        case 'client':
          const nameA = a.nomUtilisateur || 'Visiteur';
          const nameB = b.nomUtilisateur || 'Visiteur';
          comparison = nameA.localeCompare(nameB);
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return recs;
  });

  // Statistiques
  stats = computed(() => ({
    total: this.reclamations().length,
    enAttente: this.reclamations().filter(r => r.statutReclamation === StatutReclamation.EN_ATTENTE).length,
    enCours: this.reclamations().filter(r => r.statutReclamation === StatutReclamation.EN_COURS).length,
    resolu: this.reclamations().filter(r => r.statutReclamation === StatutReclamation.RESOLU).length,
    urgentesNonTraitees: this.reclamations().filter(r =>
      r.prioriteReclamation === PrioriteReclamation.URGENTE &&
      (r.statutReclamation === StatutReclamation.EN_ATTENTE || r.statutReclamation === StatutReclamation.EN_COURS)
    ).length
  }));

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.reclamationService.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement');
        this.isLoading.set(false);
        console.error('Erreur:', err);
      }
    });
  }

  changeSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  getSortIcon(field: SortField): string {
    if (this.sortField() !== field) return '↕️';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  resetFilters(): void {
    this.filtreStatut.set('');
    this.filtreType.set('');
    this.filtrePriorite.set('');
  }

  openModal(reclamation: ReclamationResponse): void {
    this.selectedReclamation.set(reclamation);
    this.modalData.statutReclamation = reclamation.statutReclamation;
    this.modalData.prioriteReclamation = reclamation.prioriteReclamation;
    this.modalData.reponse = reclamation.reponse || '';
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedReclamation.set(null);
  }

  submitResponse(): void {
    const rec = this.selectedReclamation();
    if (!rec || !this.modalData.reponse.trim()) return;

    this.isProcessing.set(true);

    const dto: TraiterReclamationDto = {
      statutReclamation: this.modalData.statutReclamation,
      prioriteReclamation: this.modalData.prioriteReclamation,
      reponse: this.modalData.reponse
    };

    this.reclamationService.traiterReclamation(rec.idReclamation, dto).subscribe({
      next: (updated) => {
        const recs = this.reclamations();
        const index = recs.findIndex(r => r.idReclamation === updated.idReclamation);
        if (index !== -1) {
          recs[index] = updated;
          this.reclamations.set([...recs]);
        }

        this.isProcessing.set(false);
        this.closeModal();
      },
      error: (err) => {
        this.isProcessing.set(false);
        alert('Erreur lors du traitement');
        console.error('Erreur:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatutClass(statut: StatutReclamation): string {
    const classes: Record<StatutReclamation, string> = {
      [StatutReclamation.EN_ATTENTE]: 'badge-warning',
      [StatutReclamation.EN_COURS]: 'badge-info',
      [StatutReclamation.RESOLU]: 'badge-success',
      [StatutReclamation.REJETE]: 'badge-danger',
      [StatutReclamation.FERME]: 'badge-secondary'
    };
    return classes[statut];
  }

  getPrioriteClass(priorite: PrioriteReclamation): string {
    const classes: Record<PrioriteReclamation, string> = {
      [PrioriteReclamation.BASSE]: 'badge-secondary',
      [PrioriteReclamation.MOYENNE]: 'badge-info',
      [PrioriteReclamation.HAUTE]: 'badge-warning',
      [PrioriteReclamation.URGENTE]: 'badge-danger'
    };
    return classes[priorite];
  }
}
