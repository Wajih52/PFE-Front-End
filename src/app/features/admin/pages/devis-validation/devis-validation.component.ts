// src/app/features/admin/devis-validation/devis-validation.component.ts
// 👑 Composant ADMIN - Validation et modification des devis

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../services/reservation.service';
import {
  ReservationResponseDto,
  DevisModificationDto,
  LigneModificationDto,
  StatutReservationLabels
} from '../../../../core/models/reservation.model';

@Component({
  selector: 'app-devis-validation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devis-validation.component.html',
  styleUrls: ['./devis-validation.component.scss']
})
export class DevisValidationComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  // Signals
  devis = signal<ReservationResponseDto[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modal de modification
  showModifModal = signal<boolean>(false);
  devisEnCours = signal<ReservationResponseDto | null>(null);

  // Formulaire de modification
  lignesModifiees: Map<number, LigneModificationDto> = new Map();
  montantTotal: number | null | undefined ;
  remisePourcentage = signal<number | null>(null);
  remiseMontant = signal<number | null>(null);
  commentaireAdmin = signal<string>('');

  // Boutons rapides de remise
  remisesRapides = [5, 10, 15, 20];

  readonly statutLabels = StatutReservationLabels;

  ngOnInit(): void {
    this.chargerDevisEnAttente();
  }

  /**
   * Charger tous les devis en attente
   */
  chargerDevisEnAttente(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getAllDevisEnAttente().subscribe({
      next: (data) => {
        this.devis.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des devis:', error);
        this.errorMessage.set('Impossible de charger les devis en attente.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Ouvrir le modal de modification d'un devis
   */
  ouvrirModalModification(devis: ReservationResponseDto): void {
    this.devisEnCours.set(devis);
    this.lignesModifiees.clear();
    this.remisePourcentage.set(devis.remisePourcentage || null);
    this.remiseMontant.set(devis.remiseMontant || null);
    this.commentaireAdmin.set(devis.commentaireAdmin || '');
    this.showModifModal.set(true);
  }

  /**
   * Appliquer une remise rapide
   */
  appliquerRemiseRapide(pourcentage: number): void {
    this.remisePourcentage.set(pourcentage);
    this.remiseMontant.set(null); // Reset le montant fixe
  }

  /**
   * Modifier une ligne (prix ou quantité)
   */
  modifierLigne(idLigne: number, champ: 'prix' | 'quantite', valeur: number): void {
    let ligne = this.lignesModifiees.get(idLigne);

    if (!ligne) {
      ligne = { idLigneReservation: idLigne };
      this.lignesModifiees.set(idLigne, ligne);
    }

    if (champ === 'prix') {
      ligne.nouveauPrixUnitaire = valeur;
    } else {
      ligne.nouvelleQuantite = valeur;
    }
  }


  /**
   * Calculer le montant total avec modifications et Remise si appliqué
   */
  calculerMontantTotal(): number {
    const devis = this.devisEnCours();
    if (!devis) return 0;

   let total = devis.montantOriginal;

    // Appliquer les modifications de lignes
    devis.lignesReservation.forEach(ligne => {
      const modif = this.lignesModifiees.get(ligne.idLigneReservation);
      if (modif) {
        // Soustraire l'ancien montant
        total -= ligne.sousTotal;

        // Calculer le nouveau montant
        const nouveauPrix = modif.nouveauPrixUnitaire || ligne.prixUnitaire;
        const nouvelleQte = modif.nouvelleQuantite || ligne.quantite;
        const jours = this.calculerJours(ligne.dateDebut, ligne.dateFin);
        total += nouveauPrix * nouvelleQte * jours;
      }
    });
  this.montantTotal = total ;
    // Appliquer la remise
    if (this.remisePourcentage()) {
      total = total * (1 - this.remisePourcentage()! / 100);
    } else if (this.remiseMontant()) {
      total = total - this.remiseMontant()!;
    }

    return Math.max(0, total);
  }

  /**
   * Calculer le sous-total d'une ligne AVEC les modifications
   * (pour affichage en temps réel dans le tableau)
   */
  calculerSousTotalLigne(ligne: any): number {
    // Vérifier s'il y a des modifications pour cette ligne
    const modif = this.lignesModifiees.get(ligne.idLigneReservation);

    // Utiliser les valeurs modifiées ou les valeurs originales
    const prix = modif?.nouveauPrixUnitaire ?? ligne.prixUnitaire;
    const quantite = modif?.nouvelleQuantite ?? ligne.quantite;
    const jours = this.calculerJours(ligne.dateDebut, ligne.dateFin);

    return prix * quantite * jours;
  }

  /**
   * Obtenir le prix affiché dans l'input (modifié ou original)
   */
  getPrixAffiche(ligne: any): number {
    const modif = this.lignesModifiees.get(ligne.idLigneReservation);
    return modif?.nouveauPrixUnitaire ?? ligne.prixUnitaire;
  }

  /**
   * Obtenir la quantité affichée dans l'input (modifiée ou originale)
   */
  getQuantiteAffichee(ligne: any): number {
    const modif = this.lignesModifiees.get(ligne.idLigneReservation);
    return modif?.nouvelleQuantite ?? ligne.quantite;
  }


  /**
   * Enregistrer les modifications et valider le devis
   */
  validerDevis(): void {
    const devis = this.devisEnCours();
    if (!devis) return;

    const modificationDto: DevisModificationDto = {
      idReservation: devis.idReservation,
      lignesModifiees: Array.from(this.lignesModifiees.values()).filter(
        ligne => ligne.nouveauPrixUnitaire !== undefined || ligne.nouvelleQuantite !== undefined
      ),
      remisePourcentage: this.remisePourcentage() || undefined,
      remiseMontant: this.remiseMontant() || undefined,
      commentaireAdmin: this.commentaireAdmin() || undefined
    };

    this.reservationService.modifierDevisParAdmin(devis.idReservation, modificationDto).subscribe({
      next: () => {
        this.successMessage.set(` Devis ${devis.referenceReservation} validé avec succès ! Le client sera notifié.`);
        this.showModifModal.set(false);
        this.chargerDevisEnAttente();// Recharger la liste

      },
      error: (error) => {
        console.error('Erreur lors de la validation:', error);
        this.errorMessage.set('Impossible de valider le devis. Veuillez réessayer.');
        this.showModifModal.set(false);
      }
    });
  }

  /**
   * Refuser/Annuler un devis
   */
  annulerDevis(devis: ReservationResponseDto): void {
    if (!confirm(`Êtes-vous sûr de vouloir annuler le devis ${devis.referenceReservation} ?`)) {
      return;
    }

    const motif = prompt('Motif de l\'annulation (optionnel):');

    this.reservationService.annulerDevisParAdmin(devis.idReservation, motif || undefined).subscribe({
      next: () => {
        this.successMessage.set(`Devis ${devis.referenceReservation} annulé.`);
        this.chargerDevisEnAttente();
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.errorMessage.set('Impossible d\'annuler le devis.');
      }
    });
  }

  /**
   * Voir les détails complets d'un devis
   */
  voirDetails(idReservation: number): void {
    this.router.navigate(['/admin/reservation-details', idReservation]);
  }

  // ============ HELPERS ============

  fermerModal(): void {
    this.showModifModal.set(false);
    this.devisEnCours.set(null);
    this.lignesModifiees.clear();
  }

  calculerJours(dateDebut: string, dateFin: string): number {
    return this.reservationService.calculateDaysBetween(dateDebut, dateFin);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  joursRestants(dateCreation: string): number {
    const creation = new Date(dateCreation);
    const expiration = new Date(creation);
    expiration.setDate(expiration.getDate() + 7);

    const today = new Date();
    const diff = expiration.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  estUrgent(dateCreation: string): boolean {
    return this.joursRestants(dateCreation) <= 2;
  }
}
