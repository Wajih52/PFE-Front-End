// src/app/features/manager/gestion-equipe/gestion-equipe.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { LivraisonService } from '../../../services/livraison.service';
import { PointageService } from '../../../services/pointage.service';
import { UserResponse, StatutCompte } from '../../../core/models';

interface EmployeStatistiques {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: number | null;
  etatCompte: StatutCompte;
  imageProfil: string | undefined;
  nombreLivraisons: number;
  livraisonsEnCours: number;
  tauxPresence: number;
}

/**
 * Gestion d'équipe pour les managers
 * Affiche la liste des employés avec statistiques et gestion
 */
@Component({
  selector: 'app-gestion-equipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-equipe.component.html',
  styleUrls: ['./gestion-equipe.component.scss']
})
export class GestionEquipeComponent implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private livraisonService = inject(LivraisonService);
  private pointageService = inject(PointageService);

  // Signals
  employes = signal<UserResponse[]>([]);
  employesStats = signal<EmployeStatistiques[]>([]);
  isLoading = signal(true);

  // Filtres
  filtreStatut = signal<StatutCompte | 'TOUS'>('TOUS');
  filtreRecherche = signal<string>('');

  // Computed - Employés filtrés
  employesFiltres = computed(() => {
    let result = [...this.employesStats()];

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      result = result.filter(e => e.etatCompte === this.filtreStatut());
    }

    // Filtre par recherche
    const recherche = this.filtreRecherche().toLowerCase();
    if (recherche) {
      result = result.filter(e =>
        e.nom.toLowerCase().includes(recherche) ||
        e.prenom.toLowerCase().includes(recherche) ||
        e.email.toLowerCase().includes(recherche)
      );
    }

    // Trier par nom
    return result.sort((a, b) => a.nom.localeCompare(b.nom));
  });

  // Statistiques globales
  statsGlobales = computed(() => {
    const total = this.employesStats().length;
    const actifs = this.employesStats().filter(e =>
      e.etatCompte === StatutCompte.ACTIVE
    ).length;
    const totalLivraisons = this.employesStats().reduce((sum, e) =>
      sum + e.nombreLivraisons, 0
    );
    const moyennePresence = total > 0 ?
      this.employesStats().reduce((sum, e) => sum + e.tauxPresence, 0) / total : 0;

    return { total, actifs, totalLivraisons, moyennePresence };
  });

  // Helpers
  readonly StatutCompte = StatutCompte;

  ngOnInit(): void {
    this.chargerEquipe();
  }

  private async chargerEquipe(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Charger tous les employés
      this.utilisateurService.getEmployesOnly().subscribe({
        next: async (employes) => {
          this.employes.set(employes);

          // Charger les statistiques pour chaque employé
          const statsPromises = employes.map(async (emp) => {
            const stats = await this.chargerStatistiquesEmploye(emp.idUtilisateur);
            return {
              idUtilisateur: emp.idUtilisateur,
              nom: emp.nom,
              prenom: emp.prenom,
              email: emp.email,
              telephone: emp.telephone,
              etatCompte: emp.etatCompte,
              imageProfil: emp.image,
              ...stats
            };
          });

          const employesAvecStats = await Promise.all(statsPromises);
          this.employesStats.set(employesAvecStats);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement employés:', err);
          this.isLoading.set(false);
        }
      });
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
      this.isLoading.set(false);
    }
  }

  private async chargerStatistiquesEmploye(idEmploye: number): Promise<{
    nombreLivraisons: number;
    livraisonsEnCours: number;
    tauxPresence: number;
  }> {
    return new Promise((resolve) => {
      let nombreLivraisons = 0;
      let livraisonsEnCours = 0;
      let tauxPresence = 0;

      // Charger les affectations de livraison
      this.livraisonService.getAffectationsByEmploye(idEmploye).subscribe({
        next: (affectations) => {
          nombreLivraisons = affectations.length;

          // Compter les livraisons en cours
          const livraisonIds = affectations.map(aff => aff.idLivraison);

          this.livraisonService.getAllLivraisons().subscribe({
            next: (livraisons) => {
              livraisonsEnCours = livraisons.filter(liv =>
                livraisonIds.includes(liv.idLivraison) &&
                (liv.statutLivraison === 'EN_ATTENTE' ||
                  liv.statutLivraison === 'EN_COURS')
              ).length;

              const dateFin = new Date().toISOString().split('T')[0]; // Aujourd'hui
              const dateDebut = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0]; // Il y a 30 jours

              // Charger les statistiques de pointage
              this.pointageService.getStatistiquesEmploye(idEmploye,dateDebut,dateFin).subscribe({
                next: (stats) => {
                  tauxPresence = stats.tauxPresence || 0;
                  resolve({ nombreLivraisons, livraisonsEnCours, tauxPresence });
                },
                error: () => {
                  resolve({ nombreLivraisons, livraisonsEnCours, tauxPresence: 0 });
                }
              });
            },
            error: () => {
              resolve({ nombreLivraisons, livraisonsEnCours: 0, tauxPresence: 0 });
            }
          });
        },
        error: () => {
          resolve({ nombreLivraisons: 0, livraisonsEnCours: 0, tauxPresence: 0 });
        }
      });
    });
  }

  // Méthodes de filtre
  changerStatut(statut: StatutCompte | 'TOUS'): void {
    this.filtreStatut.set(statut);
  }

  changerRecherche(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtreRecherche.set(input.value);
  }

  // Méthodes d'affichage
  getImageUrl(imagePath: string | null| undefined): string {
    if (!imagePath) return 'assets/images/default-avatar.png';
    return `http://localhost:8080${imagePath}`;
  }

  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }

  getStatutBadgeClass(statut: StatutCompte): string {
    switch (statut) {
      case StatutCompte.ACTIVE:
        return 'badge-success';
      case StatutCompte.SUSPENDU:
        return 'badge-danger';
      case StatutCompte.DESACTIVE:
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  getStatutLabel(statut: StatutCompte): string {
    switch (statut) {
      case StatutCompte.ACTIVE:
        return 'Actif';
      case StatutCompte.DESACTIVE:
        return 'Desactivé';
      case StatutCompte.SUSPENDU:
        return 'Suspendu';
      default:
        return statut;
    }
  }
}
