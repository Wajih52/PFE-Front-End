// src/app/features/pages/panier/panier.component.ts
// 🛒 COMPOSANT PANIER COMPLET - Gestion du panier d'achat

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService } from '../../../services/panier.service';
import { ReservationService } from '../../../services/reservation.service';
import { ProduitService } from '../../../services/produit.service';
import { LignePanier } from '../../../core/models/panier.model';
import { DevisRequestDto } from '../../../core/models/reservation.model';
import { ToastrService } from 'ngx-toastr';
import {NotificationService} from '../../../services/notification.service';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.scss']
})
export class PanierComponent implements OnInit {
  private panierService = inject(PanierService);
  private reservationService = inject(ReservationService);
  private produitService = inject(ProduitService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private notificationService = inject(NotificationService);

  // ============================================
  // STATE SIGNALS
  // ============================================

  // Panier state (computed depuis le service)
  lignes = this.panierService.lignes;
  totalArticles = this.panierService.totalArticles;
  montantTotal = this.panierService.montantTotal;
  estVide = this.panierService.estVide;

  // Loading states
  isValidating = signal<boolean>(false);
  isCheckingAvailability = signal<boolean>(false);

  // Observations client
  observations = signal<string>('');

  // Mode de validation
  modeValidation = signal<'devis' | 'direct'>('devis');

  // Disponibilité temps réel (optionnel)
  disponibilites = signal<Map<number, boolean>>(new Map());

  // ============================================
  // LIFECYCLE
  // ============================================

  ngOnInit(): void {
    // Charger les observations sauvegardées
    const savedObservations = this.panierService.getObservations();
    if (savedObservations) {
      this.observations.set(savedObservations);
    }

    // Vérifier les disponibilités (optionnel, au chargement)
    this.verifierDisponibilites();
  }

  // ============================================
  // GESTION DU PANIER
  // ============================================

  /**
   * Modifier la quantité d'une ligne
   */
  modifierQuantite(ligne: LignePanier, nouvelleQuantite: number): void {
    if (nouvelleQuantite < 1) {
      this.toastr.warning('La quantité doit être au moins 1', '⚠️ Quantité invalide');
      return;
    }

    // Vérifier la disponibilité pour la nouvelle quantité
    this.produitService.verifierDisponibiliteSurPeriode(
      ligne.idProduit,
      nouvelleQuantite,
      ligne.dateDebut,
      ligne.dateFin
    ).subscribe({
      next: (disponibilite) => {
        if (disponibilite.disponible) {
          this.panierService.modifierQuantite(
            ligne.idProduit,
            ligne.dateDebut,
            ligne.dateFin,
            nouvelleQuantite
          );
          this.toastr.success('Quantité mise à jour', '✅ Panier');
        } else {
          //this.notificationService.success(disponibilite.message || 'Quantité non disponible');
          this.toastr.error(
            disponibilite.message || 'Quantité non disponible',
            '❌ Stock insuffisant'
          );
        }
      },
      error: (error) => {
        console.error('Erreur vérification disponibilité:', error);
        this.toastr.error('Impossible de vérifier la disponibilité', '❌ Erreur');
      }
    });
  }

  /**
   * Retirer une ligne du panier
   */
  retirerLigne(ligne: LignePanier): void {
    if (confirm(`Retirer "${ligne.nomProduit}" du panier ?`)) {
      this.panierService.supprimerLigne(
        ligne.idProduit,
        ligne.dateDebut,
        ligne.dateFin
      );
    }
  }

  /**
   * Vider complètement le panier
   */
  viderPanier(): void {
    if (confirm('Voulez-vous vraiment vider le panier ?')) {
      this.panierService.viderPanier();
      this.observations.set('');
    }
  }

  /**
   * Modifier les observations d'une ligne
   */
  modifierObservationsLigne(ligne: LignePanier, observations: string): void {
    this.panierService.modifierObservationsLigne(
      ligne.idProduit,
      ligne.dateDebut,
      ligne.dateFin,
      observations
    );
  }

  /**
   * Sauvegarder les observations
   */
  sauvegarderObservations(): void {
    this.panierService.setObservations(this.observations());
    this.toastr.info('Observations enregistrées', 'ℹ️ Panier');
  }

  // ============================================
  // VÉRIFICATION DISPONIBILITÉ
  // ============================================

  /**
   * Vérifier les disponibilités de tous les produits du panier
   */
  verifierDisponibilites(): void {
    const lignes = this.lignes();

    if (lignes.length === 0) {
      return;
    }

    this.isCheckingAvailability.set(true);

    // Créer un tableau de vérifications
    const verifications = lignes.map(ligne => ({
      idProduit: ligne.idProduit,
      quantite: ligne.quantite,
      dateDebut: ligne.dateDebut,
      dateFin: ligne.dateFin
    }));

    // Appeler l'API de vérification multiple (si disponible)
    // Sinon, vérifier une par une
    lignes.forEach(ligne => {
      this.produitService.verifierDisponibiliteSurPeriode(
        ligne.idProduit,
        ligne.quantite,
        ligne.dateDebut,
        ligne.dateFin
      ).subscribe({
        next: (disponibilite) => {
          const dispos = new Map(this.disponibilites());
          dispos.set(ligne.idProduit, disponibilite.disponible);
          this.disponibilites.set(dispos);
        },
        error: (error) => {
          console.error('Erreur vérification disponibilité:', error);
        }
      });
    });

    this.isCheckingAvailability.set(false);
  }

  /**
   * Vérifier si une ligne est disponible
   */
  isLigneDisponible(idProduit: number): boolean {
    return this.disponibilites().get(idProduit) !== false;
  }

  // ============================================
  // VALIDATION DU PANIER
  // ============================================

  /**
   * Valider le panier et créer un devis
   */
  demanderDevis(): void {
    if (this.estVide()) {
      this.toastr.warning('Votre panier est vide', '⚠️ Panier vide');
      return;
    }

    // Vérifier que toutes les lignes sont disponibles
    const toutesDisponibles = Array.from(this.lignes()).every(
      ligne => this.isLigneDisponible(ligne.idProduit)
    );

    if (!toutesDisponibles) {
      this.toastr.error(
        'Certains produits ne sont plus disponibles. Veuillez mettre à jour votre panier.',
        '❌ Disponibilité'
      );
      return;
    }

    this.isValidating.set(true);

    // Préparer la requête de devis
    const devisRequest: DevisRequestDto = {
      lignesReservation: this.lignes().map(ligne => ({
        idProduit: ligne.idProduit,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        dateDebut: ligne.dateDebut,
        dateFin: ligne.dateFin,
        observations: ligne.observations
      })),
      observationsClient: this.observations() || undefined,
      validationAutomatique: false // false = demande de devis
    };

    // Appeler le backend
    this.reservationService.creerDevis(devisRequest).subscribe({
      next: (devis) => {
        this.toastr.success(
          'Votre demande de devis a été envoyée avec succès !',
          '✅ Devis créé'
        );

        // Vider le panier
        this.panierService.viderPanier();
        this.observations.set('');

        // Rediriger vers "Mes Commandes"
        setTimeout(() => {
          this.router.navigate(['/client/mes-commandes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur création devis:', error);
        this.toastr.error(
          error.error?.message || 'Impossible de créer le devis',
          '❌ Erreur'
        );
        this.isValidating.set(false);
      }
    });
  }

  /**
   * Commander directement (sans validation admin)
   */
  commanderDirectement(): void {
    if (this.estVide()) {
      this.toastr.warning('Votre panier est vide', '⚠️ Panier vide');
      return;
    }

    if (!confirm('Confirmer la commande immédiate ? (Pas de validation admin)')) {
      return;
    }

    this.isValidating.set(true);

    // Préparer la requête avec validation automatique
    const devisRequest: DevisRequestDto = {
      lignesReservation: this.lignes().map(ligne => ({
        idProduit: ligne.idProduit,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        dateDebut: ligne.dateDebut,
        dateFin: ligne.dateFin
      })),
      observationsClient: this.observations() || undefined,
      validationAutomatique: true // true = commande directe
    };

    this.reservationService.creerDevis(devisRequest).subscribe({
      next: (reservation) => {
        this.toastr.success(
          'Votre commande a été confirmée avec succès !',
          '✅ Commande validée'
        );

        // Vider le panier
        this.panierService.viderPanier();
        this.observations.set('');

        // Rediriger vers "Mes Commandes"
        setTimeout(() => {
          this.router.navigate(['/client/mes-commandes']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur création commande:', error);
        this.toastr.error(
          error.error?.message || 'Impossible de créer la commande',
          '❌ Erreur'
        );
        this.isValidating.set(false);
      }
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obtenir l'URL de l'image d'un produit
   */
  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return 'assets/images/placeholder-product.jpg';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Images du serveur backend
    return `http://localhost:8080${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  }

  /**
   * Calculer le nombre de jours
   */
  calculerNbJours(dateDebut: string, dateFin: string): number {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    return Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Formater une date
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Retour au catalogue
   */
  continuerAchats(): void {
    this.router.navigate(['/catalogue']);
  }
}
