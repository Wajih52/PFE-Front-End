// src/app/features/client/reservation-details/reservation-details.component.ts
// 📋 Composant détails réservation/devis avec modification dates et annulation

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../services/reservation.service';
import {
  ReservationResponseDto,
  LigneReservationResponseDto,
  ModifierUneLigneRequestDto,
  DecalerToutesLignesRequestDto,
  ModificationDatesResponseDto,
  StatutReservationLabels, LigneReservationRequestDto
} from '../../../core/models/reservation.model';
import {ProduitResponse} from '../../../core/models';
import {LigneReservationService} from '../../../services/ligne-reservation.service';
import {ProduitService} from '../../../services/produit.service';
import {StorageService} from '../../../core/services/storage.service';
import { FactureService } from '../../../services/facture.service';
import { FactureResponse } from '../../../core/models/facture.model';


@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})
export class ReservationDetailsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private ligneReservationService = inject(LigneReservationService);
  private produitService = inject(ProduitService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storage= inject(StorageService);
  private factureService = inject(FactureService);

  // Signals
  reservation = signal<ReservationResponseDto | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Modals
  showDecalageModal = signal<boolean>(false);
  showModifierLigneModal = signal<boolean>(false);
  showAnnulerModal = signal<boolean>(false);

  // 🆕 NOUVEAUX MODALS pour gestion des lignes
  showAjouterLigneModal = signal<boolean>(false);
  showEditerLigneModal = signal<boolean>(false);
  showSupprimerLigneModal = signal<boolean>(false);


  // Formulaires
  nombreJoursDecalage = signal<number>(0);
  motifDecalage = signal<string>('');
  motifAnnulation = signal<string>('');

  ligneSelectionnee = signal<LigneReservationResponseDto | null>(null);
  nouvelleDateDebut = signal<string>('');
  nouvelleDateFin = signal<string>('');
  motifModifLigne = signal<string>('');

  // 🆕 NOUVEAUX FORMULAIRES pour ajouter/éditer une ligne
  produitsDisponibles = signal<ProduitResponse[]>([]);
  formulaireLigne = signal<LigneReservationRequestDto>({
    idProduit: 0,
    quantite: 1,
    dateDebut: '',
    dateFin: '',
    observations: ''
  });

  // Labels
  readonly statutLabels = StatutReservationLabels;

  factures = signal<FactureResponse[]>([]);
  loadingFactures = signal<boolean>(false);

  ngOnInit(): void {
    const idReservation = this.route.snapshot.params['id'];
    if (idReservation) {
      this.chargerReservation(+idReservation);
      this.chargerProduitsDisponibles();
      this.chargerFactures();
    }
  }

  /**
   * Charger les détails de la réservation
   */
  chargerReservation(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.reservationService.getReservationById(id).subscribe({
      next: (data) => {
        this.reservation.set(data);
        this.isLoading.set(false);

      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.errorMessage.set('Impossible de charger les détails. Veuillez réessayer.');
        this.isLoading.set(false);
      }
    });
  }

  chargerFactures(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loadingFactures.set(true);

    this.factureService.getFacturesByReservation(+id).subscribe({
      next: (factures) => {
        this.factures.set(factures);
        this.loadingFactures.set(false);
      },
      error: (error) => {
        console.error('Erreur chargement factures:', error);
        this.loadingFactures.set(false);
      }
    });
  }
  telechargerFacture(facture: FactureResponse): void {
    this.factureService.downloadFacturePdf(
      facture.idFacture,
      facture.numeroFacture
    );
  }

  voirDetailFacture(facture: FactureResponse): void {
    // Navigation selon le rôle
    const role = this.storage.getUserRoles();
    if (role.includes('CLIENT')) {
      this.router.navigate(['/client/mes-factures', facture.idFacture]);
    } else {
      this.router.navigate(['/admin/factures', facture.idFacture]);
    }
  }
   getPrixIntermediaire(
    montantTotal: number,
    remisePourcentage?: number,
    remiseMontant?: number
  ): number {
    if (remisePourcentage != null&& remisePourcentage > 0) {
      return montantTotal / (1 - remisePourcentage / 100);
    }
    if (remiseMontant != null  && remiseMontant > 0) {
      return montantTotal + remiseMontant;

    }
    return montantTotal; // aucune remise
  }

  /**
   * Charger la liste des produits pour ajouter une ligne
   */
  chargerProduitsDisponibles(): void {
    this.produitService.getProduitsDisponibles().subscribe({
      next: (produits) => {
        this.produitsDisponibles.set(produits);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des produits:', error);
      }
    });
  }

  onDatesChange(): void {
    const res = this.reservation();
    const formulaire = this.formulaireLigne();

    if (formulaire.dateDebut > formulaire.dateFin) {
      this.errorMessage.set('La date de début est supérieur à la date de fin'); // Recharge tout + recalcule disponibilités
    }else {
      this.errorMessage.set('')
    }
  }
  // ============================================
  // 🆕 GESTION DES LIGNES : AJOUTER
  // ============================================

  /**
   * Ouvrir le modal pour ajouter une ligne
   */
  ouvrirModalAjouterLigne(): void {
    const res = this.reservation();
    if (!res) return;

    this.formulaireLigne.set({
      idProduit: 0,
      quantite: 1,
      dateDebut: res.dateDebut,
      dateFin: res.dateFin,
      observations: ''
    });
    this.errorMessage.set('');
    this.showAjouterLigneModal.set(true);
  }

  /**
   * Ajouter une nouvelle ligne à la réservation
   */
  ajouterNouvelleLigne(): void {
    const res = this.reservation();
    const formulaire = this.formulaireLigne();

    if (!res || !formulaire.idProduit) {
      this.errorMessage.set('Veuillez sélectionner un produit.');
      return;
    }

    if (!formulaire.dateDebut || !formulaire.dateFin) {
      this.errorMessage.set('Les dates sont obligatoires.');
      return;
    }

    if (formulaire.quantite < 1) {
      this.errorMessage.set('La quantité doit être au moins 1.');
      return;
    }

    // Appeler le service
    this.ligneReservationService.ajouterLigneReservation(
      res.idReservation,
      formulaire
    ).subscribe({
      next: (ligneCree) => {
        this.successMessage.set(`✅ Ligne "${ligneCree.nomProduit}" ajoutée avec succès !`);
        this.showAjouterLigneModal.set(false);
        // Recharger la réservation pour voir les changements
        this.chargerReservation(res.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout:', error);
        this.errorMessage.set(error.error?.message || 'Impossible d\'ajouter la ligne. Vérifiez la disponibilité.');
      }
    });
  }

  // ============================================
  // 🆕 GESTION DES LIGNES : ÉDITER
  // ============================================

  /**
   * Ouvrir le modal pour éditer une ligne (quantité/dates/observations)
   */
  ouvrirModalEditerLigne(ligne: LigneReservationResponseDto): void {
    this.ligneSelectionnee.set(ligne);
    this.formulaireLigne.set({
      idProduit: ligne.idProduit,
      quantite: ligne.quantite,
      dateDebut: ligne.dateDebut,
      dateFin: ligne.dateFin,
      observations: ligne.observations || ''
    });
    this.errorMessage.set('');
    this.showEditerLigneModal.set(true);
  }

  /**
   * Enregistrer les modifications d'une ligne
   */
  enregistrerModificationLigne(): void {
    const ligne = this.ligneSelectionnee();
    const formulaire = this.formulaireLigne();

    if (!ligne) return;

    if (!formulaire.dateDebut || !formulaire.dateFin) {
      this.errorMessage.set('Les dates sont obligatoires.');
      return;
    }

    if (formulaire.quantite < 1) {
      this.errorMessage.set('La quantité doit être au moins 1.');
      return;
    }

    // Appeler le service
    this.ligneReservationService.modifierLigne(
      ligne.idLigneReservation,
      formulaire
    ).subscribe({
      next: (ligneModifiee) => {
        this.successMessage.set(` Ligne "${ligneModifiee.nomProduit}" modifiée avec succès !`);
        this.showEditerLigneModal.set(false);
        // Recharger la réservation
        const res = this.reservation();
        if (res) this.chargerReservation(res.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de modifier la ligne. Vérifiez la disponibilité.');
      }
    });
  }

  // ============================================
  // 🆕 GESTION DES LIGNES : SUPPRIMER
  // ============================================

  /**
   * Ouvrir le modal de confirmation de suppression
   */
  ouvrirModalSupprimerLigne(ligne: LigneReservationResponseDto): void {
    this.ligneSelectionnee.set(ligne);
    this.errorMessage.set('');
    this.showSupprimerLigneModal.set(true);
  }

  /**
   * Supprimer une ligne de la réservation
   */
  confirmerSuppressionLigne(): void {
    const ligne = this.ligneSelectionnee();
    if (!ligne) return;

    this.ligneReservationService.supprimerLigne(ligne.idLigneReservation).subscribe({
      next: (response) => {
        this.successMessage.set(`✅ Ligne "${ligne.nomProduit}" supprimée avec succès !`);
        this.showSupprimerLigneModal.set(false);
        // Recharger la réservation
        const res = this.reservation();
        if (res) this.chargerReservation(res.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de supprimer la ligne.');
        this.showSupprimerLigneModal.set(false);
      }
    });
  }


  // ============================================
  // DÉCALAGE GLOBAL
  // ============================================

  /**
   * Ouvrir le modal de décalage global
   */
  ouvrirModalDecalage(): void {
    this.nombreJoursDecalage.set(0);
    this.motifDecalage.set('');
    this.showDecalageModal.set(true);
  }

  /**
   * Décaler toutes les lignes
   */
  decalerToutesLesLignes(): void {
    const reservation = this.reservation();
    if (!reservation) return;

    if (this.nombreJoursDecalage() === 0) {
      this.errorMessage.set('Veuillez indiquer un nombre de jours.');
      return;
    }

    if (!this.motifDecalage().trim()) {
      this.errorMessage.set('Veuillez indiquer un motif.');
      return;
    }

    const request: DecalerToutesLignesRequestDto = {
      nombreJours: this.nombreJoursDecalage(),
      motif: this.motifDecalage()
    };

    this.reservationService.decalerToutesLesLignes(reservation.idReservation, request).subscribe({
      next: (response) => {
        this.successMessage.set(` Dates décalées de ${request.nombreJours} jour(s) avec succès !`);
        this.showDecalageModal.set(false);
        this.afficherRecapitulatif(response);
        // Recharger les données
        this.chargerReservation(reservation.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors du décalage:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de décaler les dates. Vérifiez la disponibilité.');
        this.showDecalageModal.set(false);
      }
    });
  }

  // ============================================
  // MODIFICATION D'UNE LIGNE
  // ============================================

  /**
   * Ouvrir le modal de modification d'une ligne
   */
  ouvrirModalModifierLigne(ligne: LigneReservationResponseDto): void {
    this.ligneSelectionnee.set(ligne);
    this.nouvelleDateDebut.set(ligne.dateDebut);
    this.nouvelleDateFin.set(ligne.dateFin);
    this.motifModifLigne.set('');
    this.showModifierLigneModal.set(true);
  }

  /**
   * Modifier une ligne spécifique
   */
  modifierUneLigne(): void {
    const reservation = this.reservation();
    const ligne = this.ligneSelectionnee();
    if (!reservation || !ligne) return;

    if (!this.nouvelleDateDebut() || !this.nouvelleDateFin()) {
      this.errorMessage.set('Veuillez renseigner les deux dates.');
      return;
    }

    const request: ModifierUneLigneRequestDto = {
      nouvelleDateDebut: this.nouvelleDateDebut(),
      nouvelleDateFin: this.nouvelleDateFin(),
      motif: this.motifModifLigne()
    };

    this.reservationService.modifierUneLigne(
      reservation.idReservation,
      ligne.idLigneReservation,
      request
    ).subscribe({
      next: (response) => {
        this.successMessage.set(` Ligne "${ligne.nomProduit}" modifiée avec succès !`);
        this.showModifierLigneModal.set(false);
        this.afficherRecapitulatif(response);
        // Recharger les données
        this.chargerReservation(reservation.idReservation);
      },
      error: (error) => {
        console.error('Erreur lors de la modification:', error);
        this.errorMessage.set(error.error?.message || 'Impossible de modifier cette ligne. Vérifiez la disponibilité.');
        this.showModifierLigneModal.set(false);
      }
    });
  }

  // ============================================
  // ANNULATION
  // ============================================

  /**
   * Ouvrir le modal d'annulation
   */
  ouvrirModalAnnuler(): void {
    this.motifAnnulation.set('');
    this.showAnnulerModal.set(true);
  }

  /**
   * Annuler la réservation
   */
  annulerReservation(): void {
    const reservation = this.reservation();
    if (!reservation) return;

    this.reservationService.annulerReservationParClient(
      reservation.idReservation,
      this.motifAnnulation()
    ).subscribe({
      next: () => {
        this.successMessage.set(' Réservation annulée avec succès.');
        this.showAnnulerModal.set(false);

        // Rediriger vers mes commandes après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/client/mes-commandes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur lors de l\'annulation:', error);
        this.errorMessage.set(error.error?.message || 'Impossible d\'annuler la réservation.');
        this.showAnnulerModal.set(false);
      }
    });
  }

  /**
   * Afficher le récapitulatif des modifications
   */
  afficherRecapitulatif(response: ModificationDatesResponseDto): void {
    console.log('📊 Récapitulatif des modifications:', response);
    // Vous pouvez afficher un modal avec les détails des modifications
  }

  // ============================================
  // HELPERS
  // ============================================

  fermerModals(): void {
    this.showDecalageModal.set(false);
    this.showModifierLigneModal.set(false);
    this.showAnnulerModal.set(false);
    this.showAjouterLigneModal.set(false);
    this.showEditerLigneModal.set(false);
    this.showSupprimerLigneModal.set(false);


  }

  peutModifier(): boolean {
    const res = this.reservation();
    if (!res) return false;
    return (res.statutReservation === 'CONFIRME' || res.statutReservation === 'EN_ATTENTE') &&
      new Date(res.dateDebut) > new Date();
  }

  peutAnnuler(): boolean {
    const res = this.reservation();
    if (!res) return false;
    return (res.statutReservation === 'CONFIRME' || res.statutReservation === 'EN_ATTENTE') &&
      new Date(res.dateDebut) > new Date();
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
  calculerJours(dateDebut: string, dateFin: string): number {
    return this.reservationService.calculateDaysBetween(dateDebut, dateFin);
  }

  getStatutBadgeClass(statut: string): string {
    return this.reservationService.getStatutBadgeClass(statut as any);
  }

  retourListeCommandes(): void {
    const res = this.reservation()
    if (this.storage.isClient()) {
      if (res?.estDevis) {
        this.router.navigate(['/client/mes-devis']);
      } else {
        this.router.navigate(['/client/mes-commandes']);
      }
    }else if (this.storage.isAdmin() || this.storage.hasRole('MANAGER') || this.storage.hasRole('EMPLOYE')) {
      this.router.navigate(['/admin/reservations']);
    }else {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Obtenir l'URL de l'image du produit
   */
  getImageUrl(ligne: LigneReservationResponseDto): string {
    if (ligne.imageProduit) {
      // Si l'image est un chemin relatif, ajouter le base URL du serveur
      if (ligne.imageProduit.startsWith('/') || ligne.imageProduit.startsWith('uploads/')) {
        return `http://localhost:8080${ligne.imageProduit.startsWith('/') ? '' : '/'}${ligne.imageProduit}`;
      }
      // Si c'est déjà une URL complète, la retourner telle quelle
      return ligne.imageProduit;
    }
    // Image placeholder si pas d'image
    return 'https://via.placeholder.com/300x250/C8A882/FFFFFF?text=' + encodeURIComponent(ligne.nomProduit);
  }
}
