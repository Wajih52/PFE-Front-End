// src/app/features/admin/pages/livraisons-list/livraisons-list.component.ts
// 🚚 Composant ADMIN/EMPLOYE - Liste des livraisons avec filtres

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LivraisonService } from '../../../../services/livraison.service';
import {
  LivraisonResponseDto,
  StatutLivraisonLabels,
  StatutLivraisonColors,
  canModifierLivraison,
  canSupprimerLivraison,
  canMarquerEnCours,
  canMarquerLivree
} from '../../../../core/models/livraison.model';
import { StatutLivraison } from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-livraisons-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './livraisons-list.component.html',
  styleUrls: ['./livraisons-list.component.scss']
})
export class LivraisonsListComponent implements OnInit {
  private livraisonService = inject(LivraisonService);
  private router = inject(Router);

  // Signals
  livraisons = signal<LivraisonResponseDto[]>([]);
  livraisonsFiltrees = signal<LivraisonResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Filtres
  filtreStatut = signal<StatutLivraison | 'TOUS'>('TOUS');
  rechercheTexte = signal<string>('');
  filtreDate = signal<string>('');

  // Labels et couleurs
  readonly statutLabels = StatutLivraisonLabels;
  readonly statutColors = StatutLivraisonColors;
  readonly statuts: (StatutLivraison | 'TOUS')[] = [
    'TOUS',
    'EN_ATTENTE',
    'EN_COURS',
    'LIVREE',
    'RETOURNEE',
    'ANNULEE'
  ];

  // Actions en cours
  actionEnCours = signal<number | null>(null);

  // Modal de confirmation
  showConfirmModal = signal<boolean>(false);
  livraisonASupprimer = signal<LivraisonResponseDto | null>(null);

  ngOnInit(): void {
    this.chargerLivraisons();
  }

  /**
   * Charger toutes les livraisons
   */
  chargerLivraisons(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.livraisonService.getAllLivraisons().subscribe({
      next: (data) => {
        this.livraisons.set(data);
        this.appliquerFiltres();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des livraisons:', error);
        this.errorMessage.set('Impossible de charger les livraisons. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Charger les livraisons d'aujourd'hui
   */
  chargerLivraisonsAujourdhui(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.livraisonService.getLivraisonsAujourdhui().subscribe({
      next: (data) => {
        this.livraisons.set(data);
        this.appliquerFiltres();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set('Impossible de charger les livraisons d\'aujourd\'hui.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Filtrer par statut
   */
  filtrerParStatut(statut: StatutLivraison | 'TOUS'): void {
    this.filtreStatut.set(statut);
    this.appliquerFiltres();
  }

  /**
   * Appliquer tous les filtres
   */
  appliquerFiltres(): void {
    let resultats = [...this.livraisons()];

    // Filtre par statut
    if (this.filtreStatut() !== 'TOUS') {
      resultats = resultats.filter(l => l.statutLivraison === this.filtreStatut());
    }

    // Filtre par recherche textuelle
    const recherche = this.rechercheTexte().toLowerCase();
    if (recherche) {
      resultats = resultats.filter(l =>
        l.titreLivraison.toLowerCase().includes(recherche) ||
        l.nomClient.toLowerCase().includes(recherche) ||
        l.prenomClient.toLowerCase().includes(recherche) ||
        l.referenceReservation.toLowerCase().includes(recherche) ||
        l.adresseLivraison.toLowerCase().includes(recherche)
      );
    }

    // Filtre par date
    if (this.filtreDate()) {
      resultats = resultats.filter(l => l.dateLivraison === this.filtreDate());
    }

    this.livraisonsFiltrees.set(resultats);
  }

  /**
   * Réinitialiser les filtres
   */
  reinitialiserFiltres(): void {
    this.filtreStatut.set('TOUS');
    this.rechercheTexte.set('');
    this.filtreDate.set('');
    this.appliquerFiltres();
  }

  /**
   * Naviguer vers les détails
   */
  voirDetails(id: number): void {
    this.router.navigate(['/admin/livraisons', id]);
  }

  /**
   * Naviguer vers la page de création
   */
  creerLivraison(): void {
    this.router.navigate(['/admin/livraisons/create']);
  }

  /**
   * Marquer une livraison en cours
   */
  marquerEnCours(livraison: LivraisonResponseDto): void {
    if (!canMarquerEnCours(livraison)) {
      return;
    }

    this.actionEnCours.set(livraison.idLivraison);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.marquerEnCours(livraison.idLivraison).subscribe({
      next: (updated) => {
        this.successMessage.set('Livraison marquée en cours avec succès !');
        this.chargerLivraisons();
        this.actionEnCours.set(null);

        // Effacer le message après 3 secondes
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Marquer une livraison comme livrée
   */
  marquerLivree(livraison: LivraisonResponseDto): void {
    if (!canMarquerLivree(livraison)) {
      return;
    }

    this.actionEnCours.set(livraison.idLivraison);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.marquerLivree(livraison.idLivraison).subscribe({
      next: (updated) => {
        this.successMessage.set('Livraison marquée comme livrée avec succès !');
        this.chargerLivraisons();
        this.actionEnCours.set(null);

        // Effacer le message après 3 secondes
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors du changement de statut.');
        this.actionEnCours.set(null);
      }
    });
  }

  /**
   * Télécharger le bon de livraison
   */
  telechargerBonLivraison(livraison: LivraisonResponseDto): void {
    this.livraisonService.downloadBonLivraison(
      livraison.idLivraison,
      livraison.titreLivraison
    );
  }

  /**
   * Demander confirmation de suppression
   */
  demanderConfirmationSuppression(livraison: LivraisonResponseDto): void {
    if (!canSupprimerLivraison(livraison)) {
      this.errorMessage.set('Cette livraison ne peut pas être supprimée.');
      return;
    }

    this.livraisonASupprimer.set(livraison);
    this.showConfirmModal.set(true);
  }

  /**
   * Supprimer une livraison
   */
  supprimerLivraison(): void {
    const livraison = this.livraisonASupprimer();
    if (!livraison) return;

    this.actionEnCours.set(livraison.idLivraison);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.livraisonService.supprimerLivraison(livraison.idLivraison).subscribe({
      next: () => {
        this.successMessage.set('Livraison supprimée avec succès !');
        this.chargerLivraisons();
        this.fermerModalConfirmation();
        this.actionEnCours.set(null);

        // Effacer le message après 3 secondes
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la suppression.');
        this.actionEnCours.set(null);
        this.fermerModalConfirmation();
      }
    });
  }

  /**
   * Fermer le modal de confirmation
   */
  fermerModalConfirmation(): void {
    this.showConfirmModal.set(false);
    this.livraisonASupprimer.set(null);
  }

  /**
   * Obtenir la classe du badge de statut
   */
  getStatutBadgeClass(statut: StatutLivraison): string {
    return `badge bg-${this.statutColors[statut]}`;
  }

  /**
   * Vérifier si une action est en cours pour une livraison
   */
  isActionEnCours(idLivraison: number): boolean {
    return this.actionEnCours() === idLivraison;
  }

  /**
   * Fonctions utilitaires exposées au template
   */
  canModifier = canModifierLivraison;
  canSupprimer = canSupprimerLivraison;
  canMarquerEnCoursFunc = canMarquerEnCours;
  canMarquerLivreeFunc = canMarquerLivree;
}
