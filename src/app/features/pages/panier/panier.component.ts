// src/app/features/pages/panier/panier.component.ts
// ✅ VERSION CORRIGÉE - Problèmes 6-10 résolus

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PanierService } from '../../../services/panier.service';
import { ReservationService } from '../../../services/reservation.service';
import { ProduitService } from '../../../services/produit.service';
import { LignePanier } from '../../../core/models/panier.model';
import { DevisRequestDto } from '../../../core/models/reservation.model';
import { ToastrService } from 'ngx-toastr';
import {ConfirmationService} from '../../../core/services/confirmation.service';

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
  private confirmationService = inject(ConfirmationService);

  // STATE SIGNALS
  lignes = this.panierService.lignes;
  totalArticles = this.panierService.totalArticles;
  nombreProduits=this.panierService.nombreProduits;
  montantTotal = this.panierService.montantTotal;
  estVide = this.panierService.estVide;

  //loading states
  isCreatingDevis = signal<boolean>(false);     // Pour "Demander devis"
  isCreatingCommande = signal<boolean>(false);   // Pour "Commander directement"
  isCheckingAvailability = signal<boolean>(false);

  // Observations client
  observations = signal<string>('');

  // Mode de validation
  modeValidation = signal<'devis' | 'direct'>('devis');

  // ✅ FIX #7: Disponibilité PAR LIGNE (pas par produit global)
  // La clé est construite comme: "idProduit-dateDebut-dateFin"
  disponibilitesParLigne = signal<Map<string, { disponible: boolean; quantiteMax: number }>>(new Map());

  ngOnInit(): void {
    const savedObservations = this.panierService.getObservations();
    if (savedObservations) {
      this.observations.set(savedObservations);
    }

    // ✅ FIX #10: Vérifier automatiquement à l'init (pas de bouton nécessaire)
    this.verifierDisponibilitesAutomatique();
  }

  /**
   * ✅ FIX #10: Vérification automatique sans bouton
   */
  private verifierDisponibilitesAutomatique(): void {
    const lignes = this.lignes();
    if (lignes.length === 0) return;

    lignes.forEach(ligne => {
      this.verifierDisponibiliteLigne(ligne);
    });
  }

  /**
   * ✅ FIX #7: Vérifier la disponibilité d'UNE ligne spécifique
   */
  private verifierDisponibiliteLigne(ligne: LignePanier): void {
    this.produitService.verifierDisponibiliteSurPeriode(
      ligne.idProduit,
      ligne.quantite,
      ligne.dateDebut,
      ligne.dateFin
    ).subscribe({
      next: (disponibilite) => {
        const cle = this.getCleUnique(ligne);
        const dispos = new Map(this.disponibilitesParLigne());
        dispos.set(cle, {
          disponible: disponibilite.disponible,
          quantiteMax: disponibilite.quantiteDisponible ?? 0
        });
        this.disponibilitesParLigne.set(dispos);
      },
      error: (error) => {
        console.error('Erreur vérification disponibilité ligne:', error);
      }
    });
  }

  /**
   * ✅ Générer une clé unique pour chaque ligne
   */
  protected getCleUnique(ligne: LignePanier): string {
    return `${ligne.idProduit}-${ligne.dateDebut}-${ligne.dateFin}`;
  }

  /**
   * ✅ FIX #7: Obtenir la disponibilité d'une ligne spécifique
   */
  getDisponibiliteLigne(ligne: LignePanier): { disponible: boolean; quantiteMax: number } | undefined {
    const cle = this.getCleUnique(ligne);
    const dispo = this.disponibilitesParLigne().get(cle);

    // ✅ DEBUG: Ajouter un console.log pour vérifier
    console.log(`📊 Disponibilité pour ${ligne.nomProduit}:`, {
      cle,
      quantiteActuelle: ligne.quantite,
      dispo
    });

    return dispo;
  }

  /**
   * ✅ FIX #7 & #8: Vérifier si une ligne est disponible
   */
  isLigneDisponible(ligne: LignePanier): boolean {
    const dispo = this.getDisponibiliteLigne(ligne);
    return dispo ? dispo.disponible : true; // Optimiste par défaut
  }

  /**
   * ✅ FIX #8 & #9: Incrémenter la quantité avec validation
   */
  incrementerQuantite(ligne: LignePanier): void {
    const dispo = this.getDisponibiliteLigne(ligne);

    // ✅ FIX #9: Vérifier si on peut incrémenter
    if (dispo && ligne.quantite >= dispo.quantiteMax) {
      this.toastr.warning(
        `Maximum ${dispo.quantiteMax} disponible(s) pour cette période`,
        ' Stock limité'
      );
      return;
    }

    const nouvelleQuantite = ligne.quantite + 1;
    this.modifierQuantite(ligne, nouvelleQuantite);
  }

  /**
   * ✅ FIX #8: Décrémenter la quantité
   */
  decrementerQuantite(ligne: LignePanier): void {
    if (ligne.quantite <= 1) {
      this.toastr.warning('La quantité minimale est 1', ' Quantité minimale');
      return;
    }

    const nouvelleQuantite = ligne.quantite - 1;

    // ✅ Mettre à jour directement le panier (pas besoin de vérifier la dispo pour décrémenter)
    this.panierService.modifierQuantite(
      ligne.idProduit,
      ligne.dateDebut,
      ligne.dateFin,
      nouvelleQuantite
    );
    //this.modifierQuantite(ligne, nouvelleQuantite);
  }

  /**
   * méthode utile pouur linput quantité souhaité dans le panier
   */
// 1️⃣ Obtenir le max
  getQuantiteMax(ligne: LignePanier): number {
    const dispo = this.getDisponibiliteLigne(ligne);
    return dispo ? dispo.quantiteMax : 1;
  }

// 2️⃣ Saisie en temps réel (avec validation)
  onQuantiteInputChange(ligne: LignePanier, event: Event): void {
    const input = event.target as HTMLInputElement;
    let nouvelleQuantite = parseInt(input.value, 10);

    if (isNaN(nouvelleQuantite) || nouvelleQuantite < 1) {
      nouvelleQuantite = 1;
      input.value = '1';
    }

    const quantiteMax = this.getQuantiteMax(ligne);
    if (nouvelleQuantite > quantiteMax) {
      nouvelleQuantite = quantiteMax;
      input.value = quantiteMax.toString();
      this.toastr.info(
        `Quantité ajustée au maximum disponible (${quantiteMax})`,
        '📊 Stock limité'
      );
    }

    // ✅ CORRECTION: Mettre à jour via le service panier pour recalculer le prix
    this.panierService.modifierQuantite(
      ligne.idProduit,
      ligne.dateDebut,
      ligne.dateFin,
      nouvelleQuantite
    );
  }

// 3️⃣ Validation finale (au blur)
  validerQuantite(ligne: LignePanier, event: Event): void {
    const input = event.target as HTMLInputElement;
    let nouvelleQuantite = parseInt(input.value, 10);

    if (isNaN(nouvelleQuantite) || nouvelleQuantite < 1) {
      nouvelleQuantite = 1;
    }

    const quantiteMax = this.getQuantiteMax(ligne);
    if (nouvelleQuantite > quantiteMax) {
      nouvelleQuantite = quantiteMax;
    }

    if (nouvelleQuantite !== ligne.quantite) {
      input.value = nouvelleQuantite.toString();
      this.modifierQuantite(ligne, nouvelleQuantite);
    }
  }

  /**
   * ✅ FIX #8: Modifier la quantité avec vérification temps réel
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
          // Mettre à jour le panier
          this.panierService.modifierQuantite(
            ligne.idProduit,
            ligne.dateDebut,
            ligne.dateFin,
            nouvelleQuantite
          );

          // Mettre à jour la disponibilité
          const cle = this.getCleUnique(ligne);
          const dispos = new Map(this.disponibilitesParLigne());
          dispos.set(cle, {
            disponible: true,
            quantiteMax: disponibilite.quantiteDisponible ?? 0
          });
          this.disponibilitesParLigne.set(dispos);

          this.toastr.success('Quantité mise à jour', '✅ Panier');
        } else {
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
   * ✅ FIX #9: Vérifier si le bouton + doit être désactivé
   */
  estQuantiteMaximale(ligne: LignePanier): boolean {
    const dispo = this.getDisponibiliteLigne(ligne);

    if(!dispo){
      return true ;
    }
    return ligne.quantite >= dispo.quantiteMax ;
  }

  /**
   * Retirer une ligne du panier
   */
 async retirerLigne(ligne: LignePanier): Promise<void> {

    const confirmed = await this.confirmationService.confirm({
      title: `Retirer "${ligne.nomProduit}" du panier ?`,
      message: '',
      confirmText: 'Retirer',
      type: 'danger'
    });
    if (confirmed) {
      this.panierService.supprimerLigne(
        ligne.idProduit,
        ligne.dateDebut,
        ligne.dateFin
      );

      // Retirer de la map de disponibilité
      const cle = this.getCleUnique(ligne);
      const dispos = new Map(this.disponibilitesParLigne());
      dispos.delete(cle);
      this.disponibilitesParLigne.set(dispos);
    }
  }

  /**
   * Vider complètement le panier
   */
  async viderPanier(): Promise <void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Voulez-vous vraiment vider le Panier ?',
      message: '',
      confirmText: 'Vider',
      type: 'danger'
    });

    if (confirmed) {
      this.panierService.viderPanier();
      this.observations.set('');
      this.disponibilitesParLigne.set(new Map());
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

  /**
   * ✅ Valider le panier et créer un devis
   */
  demanderDevis(): void {
    if (this.estVide()) {
      this.toastr.warning('Votre panier est vide', '⚠️ Panier vide');
      return;
    }

    // ✅ Vérifier que toutes les lignes sont disponibles
    const lignes = this.lignes();
    const toutesDisponibles = lignes.every(ligne => this.isLigneDisponible(ligne));

    if (!toutesDisponibles) {
      this.toastr.error(
        'Certains produits ne sont plus disponibles. Veuillez retirer les lignes indisponibles.',
        '❌ Produits indisponibles'
      );
      return;
    }

    this.isCreatingDevis.set(true);

    const devisRequest: DevisRequestDto = {
      lignesReservation: lignes.map(ligne => ({
        idProduit: ligne.idProduit,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        dateDebut: ligne.dateDebut,
        dateFin: ligne.dateFin,
        observationsClient: ligne.observations
      })),
      observationsClient: this.observations(),
      validationAutomatique: false
    };

    this.reservationService.creerDevis(devisRequest).subscribe({
      next: (reservation) => {
        this.toastr.success('Votre demande de devis a été envoyée', '✅ Devis créé');
        this.panierService.viderPanier();
        this.router.navigate(['/mes-commandes']);
      },
      error: (error) => {
        console.error('Erreur création devis:', error);
        this.toastr.error('Impossible de créer le devis', '❌ Erreur');
        this.isCreatingDevis.set(false);
      }
    });
  }

  /**
   * ✅ Valider le panier et commander directement
   */
  commanderDirectement(): void {
    if (this.estVide()) {
      this.toastr.warning('Votre panier est vide', '⚠️ Panier vide');
      return;
    }

    // ✅ Vérifier que toutes les lignes sont disponibles
    const lignes = this.lignes();
    const toutesDisponibles = lignes.every(ligne => this.isLigneDisponible(ligne));

    if (!toutesDisponibles) {
      this.toastr.error(
        'Certains produits ne sont plus disponibles. Veuillez retirer les lignes indisponibles.',
        '❌ Produits indisponibles'
      );
      return;
    }

    this.isCreatingCommande.set(true);

    const devisRequest: DevisRequestDto = {
      lignesReservation: lignes.map(ligne => ({
        idProduit: ligne.idProduit,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        dateDebut: ligne.dateDebut,
        dateFin: ligne.dateFin,
        observationsClient: ligne.observations
      })),
      observationsClient: this.observations(),
      validationAutomatique: true
    };

    this.reservationService.creerDevis(devisRequest).subscribe({
      next: (reservation) => {
        this.toastr.success('Votre commande a été Crée', ' Commande créé');
        this.panierService.viderPanier();
        this.router.navigate(['/mes-commandes']);
      },
      error: (error) => {
        console.error('Erreur création Commande:', error);
        this.toastr.error('Impossible de créer la Commande', ' Erreur');
        this.isCreatingCommande.set(false);
      }
    });
  }


  /**
   * Continuer les achats
   */
  continuerAchats(): void {
    this.router.navigate(['/catalogue']);
  }

  /**
   * ✅ FIX #3: Obtenir l'URL complète de l'image du produit
   */
  getImageUrl(ligne: LignePanier): string {
    if (ligne.imageProduit) {
      // Si l'image est un chemin relatif, ajouter le base URL du serveur
      if (ligne.imageProduit.startsWith('/') || ligne.imageProduit.startsWith('uploads/')) {
        return `http://localhost:8080${ligne.imageProduit.startsWith('/') ? '' : '/'}${ligne.imageProduit}`;
      }
      // Si c'est déjà une URL complète, la retourner telle quelle
      return ligne.imageProduit;
    }
    // Image placeholder si pas d'image
    return `https://via.placeholder.com/120x120/C8A882/FFFFFF?text=${encodeURIComponent(ligne.nomProduit)}`;
  }

  /**
   * ✅ FIX #3: Gestion des erreurs d'image
   */
  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'https://via.placeholder.com/120x120/CCCCCC/FFFFFF?text=Image+Non+Disponible';
  }
}
