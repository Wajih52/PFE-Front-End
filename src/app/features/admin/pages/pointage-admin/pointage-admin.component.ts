// src/app/features/admin/pointage-admin/pointage-admin.component.ts

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PointageService } from '../../../../services/pointage.service';
import { PointageResponse, StatistiquesPointage, PointageRequest } from '../../../../core/models/pointage.model';
import { StatutPointage, StatutPointageLabels, StatutPointageColors, StatutPointageIcons } from '../../../../core/models/pointage.enums';

interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  pseudo: string;
  poste?: string;
}

@Component({
  selector: 'app-pointage-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pointage-admin.component.html',
  styleUrl: './pointage-admin.component.scss'
})
export class PointageAdminComponent implements OnInit {

  // Signals pour la vue globale
  pointagesAujourdhui = signal<PointageResponse[]>([]);
  pointagesPeriode = signal<PointageResponse[]>([]);
  employesAbsents = signal<number[]>([]);

  // Signals pour les filtres
  dateDebut = signal<string>(this.getFirstDayOfMonth());
  dateFin = signal<string>(this.getTodayString());
  statutFiltre = signal<StatutPointage | ''>('');
  employeFiltre = signal<number | null>(null);

  // Signals pour la gestion
  showCreateModal = signal(false);
  showEditModal = signal(false);
  selectedPointage = signal<PointageResponse | null>(null);
  isLoading = signal(false);

  // Formulaires
  createForm = signal<PointageRequest>({
    dateTravail: this.getTodayString(),
    heureDebut: undefined,
    heureFin: undefined,
    statutPointage: StatutPointage.PRESENT,
    description: '',
    idUtilisateur: undefined
  });

  editForm = signal<PointageRequest>({
    dateTravail: '',
    heureDebut: undefined,
    heureFin: undefined,
    statutPointage: StatutPointage.PRESENT,
    description: ''
  });

  // Liste des employés (à charger depuis votre service utilisateur)
  employes = signal<Utilisateur[]>([]);

  // Employé sélectionné pour statistiques
  employeStatsId = signal<number | null>(null);
  statistiquesEmploye = signal<StatistiquesPointage | null>(null);

  // Vue active
  activeView = signal<'global' | 'employe' | 'stats'>('global');

  // Computed
  pointagesFiltres = computed(() => {
    let pointages = this.pointagesPeriode();

    if (this.statutFiltre()) {
      pointages = pointages.filter(p => p.statutPointage === this.statutFiltre());
    }

    if (this.employeFiltre()) {
      pointages = pointages.filter(p => p.idUtilisateur === this.employeFiltre());
    }

    return pointages;
  });

  nombrePresents = computed(() =>
    this.pointagesAujourdhui().filter(p => p.statutPointage === StatutPointage.PRESENT).length
  );

  nombreAbsents = computed(() =>
    this.pointagesAujourdhui().filter(p => p.statutPointage === StatutPointage.ABSENT).length
  );

  nombreRetards = computed(() =>
    this.pointagesAujourdhui().filter(p => p.statutPointage === StatutPointage.EN_RETARD).length
  );

  nombreConges = computed(() =>
    this.pointagesAujourdhui().filter(p => p.statutPointage === StatutPointage.EN_CONGE).length
  );

  // Helpers
  readonly statutLabels = StatutPointageLabels;
  readonly statutColors = StatutPointageColors;
  readonly statutIcons = StatutPointageIcons;
  readonly StatutPointage = StatutPointage;

  constructor(private pointageService: PointageService) {}

  ngOnInit(): void {
    this.loadPointagesAujourdhui();
    this.loadPointagesPeriode();
    // this.loadEmployes(); // À implémenter avec votre service utilisateur
  }

  // ============ CHARGEMENT DES DONNÉES ============

  loadPointagesAujourdhui(): void {
    this.isLoading.set(true);

    this.pointageService.getPointagesAujourdhui().subscribe({
      next: (pointages) => {
        this.pointagesAujourdhui.set(pointages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement pointages:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadPointagesPeriode(): void {
    this.isLoading.set(true);

    this.pointageService.getTousLesPointages(
      this.dateDebut(),
      this.dateFin()
    ).subscribe({
      next: (pointages) => {
        this.pointagesPeriode.set(pointages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement période:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadEmployesAbsents(): void {
    const today = this.getTodayString();

    this.pointageService.getEmployesAbsents(today).subscribe({
      next: (ids) => {
        this.employesAbsents.set(ids);
      },
      error: (error) => {
        console.error('Erreur chargement absents:', error);
      }
    });
  }

  loadStatistiquesEmploye(idEmploye: number): void {
    this.isLoading.set(true);

    this.pointageService.getStatistiquesEmploye(
      idEmploye,
      this.dateDebut(),
      this.dateFin()
    ).subscribe({
      next: (stats) => {
        this.statistiquesEmploye.set(stats);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement statistiques:', error);
        this.isLoading.set(false);
      }
    });
  }

  // ============ FILTRES ============

  appliquerFiltres(): void {
    this.loadPointagesPeriode();
  }

  reinitialiserFiltres(): void {
    this.dateDebut.set(this.getFirstDayOfMonth());
    this.dateFin.set(this.getTodayString());
    this.statutFiltre.set('');
    this.employeFiltre.set(null);
    this.loadPointagesPeriode();
  }

  // ============ GESTION DES POINTAGES ============

  openCreateModal(): void {
    this.createForm.set({
      dateTravail: this.getTodayString(),
      heureDebut: undefined,
      heureFin: undefined,
      statutPointage: StatutPointage.PRESENT,
      description: '',
      idUtilisateur: undefined
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  creerPointage(): void {
    const form = this.createForm();

    if (!form.idUtilisateur || !form.dateTravail) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading.set(true);

    this.pointageService.creerPointageManuel(form).subscribe({
      next: () => {
        this.closeCreateModal();
        this.loadPointagesAujourdhui();
        this.loadPointagesPeriode();
        this.isLoading.set(false);
        alert('Pointage créé avec succès !');
      },
      error: (error) => {
        this.isLoading.set(false);
        alert(error.error?.message || 'Erreur lors de la création');
      }
    });
  }

  openEditModal(pointage: PointageResponse): void {
    this.selectedPointage.set(pointage);
    this.editForm.set({
      dateTravail: pointage.dateTravail,
      heureDebut: pointage.heureDebut,
      heureFin: pointage.heureFin,
      statutPointage: pointage.statutPointage,
      description: pointage.description || ''
    });
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedPointage.set(null);
  }

  modifierPointage(): void {
    const pointage = this.selectedPointage();
    if (!pointage) return;

    this.isLoading.set(true);

    this.pointageService.modifierPointage(
      pointage.idPointage,
      this.editForm()
    ).subscribe({
      next: () => {
        this.closeEditModal();
        this.loadPointagesAujourdhui();
        this.loadPointagesPeriode();
        this.isLoading.set(false);
        alert('Pointage modifié avec succès !');
      },
      error: (error) => {
        this.isLoading.set(false);
        alert(error.error?.message || 'Erreur lors de la modification');
      }
    });
  }

  supprimerPointage(idPointage: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
      return;
    }

    this.isLoading.set(true);

    this.pointageService.supprimerPointage(idPointage).subscribe({
      next: () => {
        this.loadPointagesAujourdhui();
        this.loadPointagesPeriode();
        this.isLoading.set(false);
        alert('Pointage supprimé avec succès !');
      },
      error: (error) => {
        this.isLoading.set(false);
        alert(error.error?.message || 'Erreur lors de la suppression');
      }
    });
  }

  marquerAbsents(): void {
    if (!confirm('Marquer tous les employés sans pointage comme absents ?')) {
      return;
    }

    this.isLoading.set(true);

    this.pointageService.marquerAbsents().subscribe({
      next: () => {
        this.loadPointagesAujourdhui();
        this.loadPointagesPeriode();
        this.isLoading.set(false);
        alert('Absents marqués avec succès !');
      },
      error: (error) => {
        this.isLoading.set(false);
        alert(error.error?.message || 'Erreur');
      }
    });
  }

  // ============ NAVIGATION ============

  changerVue(vue: 'global' | 'employe' | 'stats'): void {
    this.activeView.set(vue);

    if (vue === 'global') {
      this.loadPointagesAujourdhui();
    }
  }

  voirDetailsEmploye(idEmploye: number): void {
    this.employeStatsId.set(idEmploye);
    this.loadStatistiquesEmploye(idEmploye);
    this.changerVue('stats');
  }

  // ============ UTILITAIRES ============

  getStatutColor(statut: string): string {
    return this.statutColors[statut as keyof typeof StatutPointageColors] || '#95a5a6';
  }

  getStatutLabel(statut: string): string {
    return this.statutLabels[statut as keyof typeof StatutPointageLabels] || statut;
  }

  getStatutIcon(statut: string): string {
    return this.statutIcons[statut as keyof typeof StatutPointageIcons] || '📌';
  }

  private getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  private getFirstDayOfMonth(): string {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  }

  updateCreateFormField(field: keyof PointageRequest, value: any): void {
    this.createForm.update(form => ({ ...form, [field]: value }));
  }

  updateEditFormField(field: keyof PointageRequest, value: any): void {
    this.editForm.update(form => ({ ...form, [field]: value }));
  }
}
