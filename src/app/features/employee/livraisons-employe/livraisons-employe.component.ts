// src/app/features/employee/livraisons-employe/livraisons-employe.component.ts

import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LivraisonService } from '../../../services/livraison.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  LivraisonResponseDto,StatutLivraisonColors,StatutLivraisonLabels
} from '../../../core/models/livraison.model';


const StatutLivraison = {
  NOT_TODAY: 'NOT_TODAY' ,
  EN_ATTENTE: 'EN_ATTENTE' ,
  EN_COURS: 'EN_COURS' ,
  LIVREE: 'LIVREE' ,
  RETOUR: 'RETOUR' ,
  RETOUR_PARTIEL: 'RETOUR_PARTIEL' ,
  RETOURNEE: 'RETOURNEE',
  ANNULEE: 'ANNULEE'
}as const;

type StatutLivraisonn =
  |'NOT_TODAY'
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'LIVREE'
  |'RETOUR'
  |'RETOUR_PARTIEL'
  | 'RETOURNEE'
  | 'ANNULEE';


type FiltrePeriode = 'toutes' | 'aujourdhui' | 'a-venir' | 'passees';

/**
 * Liste des livraisons affectées à l'employé connecté
 */
@Component({
  selector: 'app-livraisons-employe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './livraisons-employe.component.html',
  styleUrls: ['./livraisons-employe.component.scss']
})
export class LivraisonsEmployeComponent implements OnInit {
  private livraisonService = inject(LivraisonService);
  private authService = inject(AuthService);

  // Signals
  mesLivraisons = signal<LivraisonResponseDto[]>([]);
  isLoading = signal(true);

  // Filtres
  filtreStatut = signal<StatutLivraisonn | 'TOUS'>('TOUS');
  filtrePeriode = signal<FiltrePeriode>('toutes');
  filtreRecherche = signal<string>('');

  // Computed - Livraisons filtrées
  livraisonsFiltrees = computed(() => {
    let result = [...this.mesLivraisons()];

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      result = result.filter(l => l.statutLivraison === this.filtreStatut());
    }

    // Filtre par période
    const today = new Date().toISOString().split('T')[0];
    switch (this.filtrePeriode()) {
      case 'aujourdhui':
        result = result.filter(l => l.dateLivraison === today);
        break;
      case 'a-venir':
        result = result.filter(l => l.dateLivraison > today);
        break;
      case 'passees':
        result = result.filter(l => l.dateLivraison < today);
        break;
    }

    // Filtre par recherche
    const recherche = this.filtreRecherche().toLowerCase();
    if (recherche) {
      result = result.filter(l =>
        l.titreLivraison.toLowerCase().includes(recherche) ||
        l.adresseLivraison.toLowerCase().includes(recherche)
      );
    }

    // Trier par date (plus récentes en premier)
    return result.sort((a, b) =>
      new Date(b.dateLivraison).getTime() - new Date(a.dateLivraison).getTime()
    );
  });

  // Statistiques
  stats = computed(() => {
    const total = this.mesLivraisons().length;
    const today = new Date().toISOString().split('T')[0];

    const aujourdhui = this.mesLivraisons().filter(l =>
      l.dateLivraison === today &&
      l.statutLivraison !== StatutLivraison.LIVREE &&
      l.statutLivraison !== StatutLivraison.ANNULEE
    ).length;

    const aVenir = this.mesLivraisons().filter(l =>
      l.dateLivraison > today &&
      l.statutLivraison !== StatutLivraison.ANNULEE
    ).length;

    const terminees = this.mesLivraisons().filter(l =>
      l.statutLivraison === StatutLivraison.LIVREE
    ).length;

    return { total, aujourdhui, aVenir, terminees };
  });

  // Helpers
  readonly StatutLivraison = {
    NOT_TODAY: 'NOT_TODAY' as const,
    EN_ATTENTE: 'EN_ATTENTE' as const,
    EN_PREPARATION: 'EN_PREPARATION' as const,
    EN_COURS: 'EN_COURS' as const,
    LIVREE: 'LIVREE' as const,
    RETOUR: 'RETOUR' as const,
    RETOUR_PARTIEL: 'RETOUR_PARTIEL' as const,
    RETOURNEE: 'RETOURNEE' as const,
    ANNULEE: 'ANNULEE' as const
  };

  readonly StatutLivraisonLabels = StatutLivraisonLabels;
  readonly StatutLivraisonColors = StatutLivraisonColors;

  ngOnInit(): void {
    this.chargerMesLivraisons();
  }

  private chargerMesLivraisons(): void {
    this.isLoading.set(true);

    const user = this.authService.getCurrentUser();
    if (!user?.idUtilisateur) {
      console.error('Utilisateur non connecté');
      this.isLoading.set(false);
      return;
    }

    // Charger les affectations de l'employé
    this.livraisonService.getAffectationsByEmploye(user.idUtilisateur).subscribe({
      next: (affectations) => {
        // Extraire les IDs des livraisons
        const livraisonIds = affectations.map(aff => aff.idLivraison);

        // Charger toutes les livraisons et filtrer
        this.livraisonService.getAllLivraisons().subscribe({
          next: (livraisons) => {
            const mesLivs = livraisons.filter(liv =>
              livraisonIds.includes(liv.idLivraison)
            );
            this.mesLivraisons.set(mesLivs);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Erreur chargement livraisons:', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Erreur chargement affectations:', err);
        this.isLoading.set(false);
      }
    });
  }

  // Méthodes de filtre
  changerStatut(statut: StatutLivraisonn | 'TOUS'): void {
    this.filtreStatut.set(statut);
  }

  changerPeriode(periode: FiltrePeriode): void {
    this.filtrePeriode.set(periode);
  }

  changerRecherche(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtreRecherche.set(input.value);
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

  getStatutIcon(statut: StatutLivraisonn): string {
    const icons: Record<StatutLivraisonn, string> = {
      'NOT_TODAY': 'timer',
      'EN_ATTENTE': 'pace',
      'EN_COURS': 'delivery_truck_speed',
      'LIVREE': 'check',
      'RETOUR': 'undo',
      'RETOUR_PARTIEL': 'undo',
      'RETOURNEE': 'assignment_returned',
      'ANNULEE': 'close',
    };
    return icons[statut] || 'assignment';
  }
}
