// src/app/core/services/panier.service.ts
// ✅ VERSION CORRIGÉE - Compatible SSR (Angular 19)

import { Injectable, signal, computed, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LignePanier, PanierState } from '../core/models/panier.model';
import { ToastrService } from 'ngx-toastr';

/**
 * Service de gestion du panier côté client
 * ✅ Compatible SSR Angular 19
 * Utilise localStorage pour la persistence (uniquement côté browser)
 * Utilise signals pour la réactivité
 */
@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private toastr = inject(ToastrService);
  private platformId = inject(PLATFORM_ID);
  private readonly STORAGE_KEY = 'elegant_hive_panier';

  // État initial vide (sera chargé après le rendu côté client)
  private panierState = signal<PanierState>({
    lignes: [],
    totalArticles: 0,
    nombreProduits: 0,
    montantTotal: 0
  });

  // Computed signals
  lignes = computed(() => this.panierState().lignes);
  totalArticles = computed(() => this.panierState().totalArticles);
  nombreProduits = computed(() => this.panierState().nombreProduits);
  montantTotal = computed(() => this.panierState().montantTotal);
  estVide = computed(() => this.panierState().lignes.length === 0);

  constructor() {
    // ✅ Charger depuis localStorage uniquement côté client après le premier rendu
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        const stored = this.loadFromStorage();
        if (stored.lignes.length > 0) {
          this.panierState.set(stored);
        }
      });
    }
  }

  /**
   * Ajouter un produit au panier
   */
  ajouterProduit(ligne: Omit<LignePanier, 'sousTotal' | 'nbJours'>): void {
    const lignes = [...this.panierState().lignes];

    // Calculer le nombre de jours
    const dateDebut = new Date(ligne.dateDebut);
    const dateFin = new Date(ligne.dateFin);
    const nbJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Calculer le sous-total
    const sousTotal = ligne.quantite * ligne.prixUnitaire * nbJours;

    // Vérifier si le produit existe déjà avec les mêmes dates
    const indexExistant = lignes.findIndex(l =>
      l.idProduit === ligne.idProduit &&
      l.dateDebut === ligne.dateDebut &&
      l.dateFin === ligne.dateFin
    );

    if (indexExistant !== -1) {
      // Mettre à jour la quantité
      lignes[indexExistant].quantite += ligne.quantite;
      lignes[indexExistant].sousTotal = lignes[indexExistant].quantite * ligne.prixUnitaire * nbJours;
     // this.toastr.success('Quantité mise à jour dans le panier', '✅ Panier');
    } else {
      // Ajouter nouvelle ligne
      lignes.push({
        ...ligne,
        sousTotal,
        nbJours ,
        observations: ''});
    //  this.toastr.success('Produit ajouté au panier', '✅ Panier');
    }

    this.updatePanier(lignes);
  }

  /**
   * Modifier la quantité d'une ligne
   */
  modifierQuantite(idProduit: number, dateDebut: string, dateFin: string, nouvelleQuantite: number): void {
    if (nouvelleQuantite < 1) {
      this.toastr.warning('La quantité doit être au moins 1', '⚠️ Attention');
      return;
    }

    const lignes = this.panierState().lignes.map(ligne => {
      if (ligne.idProduit === idProduit && ligne.dateDebut === dateDebut && ligne.dateFin === dateFin) {
        return {
          ...ligne,
          quantite: nouvelleQuantite,
          sousTotal: nouvelleQuantite * ligne.prixUnitaire * ligne.nbJours
        };
      }
      return ligne;
    });

    this.updatePanier(lignes);
  }
  /**
   * Modifier les observations d'une ligne spécifique
   */
  modifierObservationsLigne(idProduit: number, dateDebut: string, dateFin: string, observations: string): void {
    const lignes = [...this.panierState().lignes];
    const index = lignes.findIndex(l =>
      l.idProduit === idProduit &&
      l.dateDebut === dateDebut &&
      l.dateFin === dateFin
    );

    if (index !== -1) {
      lignes[index].observations = observations;
      this.updatePanier(lignes);
    }
  }

  /**
   * Supprimer une ligne du panier
   */
  supprimerLigne(idProduit: number, dateDebut: string, dateFin: string): void {
    const lignes = this.panierState().lignes.filter(ligne =>
      !(ligne.idProduit === idProduit && ligne.dateDebut === dateDebut && ligne.dateFin === dateFin)
    );

    this.updatePanier(lignes);
    this.toastr.info('Produit retiré du panier', 'ℹ️ Panier');
  }



  /**
   * Vider complètement le panier
   */
  viderPanier(): void {
    this.updatePanier([]);
    this.toastr.info('Panier vidé', 'ℹ️ Panier');
  }

  /**
   * Obtenir le panier pour création du devis
   */
  getPanierPourDevis(): LignePanier[] {
    return this.panierState().lignes;
  }

  /**
   * Définir les observations client
   */
  setObservations(observations: string): void {
    this.panierState.update(state => ({
      ...state,
      observationsClient: observations
    }));
    this.saveToStorage();
  }

  /**
   * Obtenir les observations
   */
  getObservations(): string | undefined {
    return this.panierState().observationsClient;
  }

  // ============ MÉTHODES PRIVÉES ============

  /**
   * Mettre à jour l'état du panier
   */
  private updatePanier(lignes: LignePanier[]): void {
    const totalArticles = lignes.reduce((sum, l) => sum + l.quantite, 0);
    const nombreProduits = lignes.length;
    const montantTotal = lignes.reduce((sum, l) => sum + l.sousTotal, 0);

    this.panierState.set({
      lignes,
      totalArticles,
      nombreProduits,
      montantTotal,
      observationsClient: this.panierState().observationsClient
    });

    this.saveToStorage();
  }

  /**
   * Sauvegarder dans localStorage (uniquement côté browser)
   */
  private saveToStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // ✅ Ne rien faire côté serveur
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.panierState()));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }

  /**
   * Charger depuis localStorage (uniquement côté browser)
   */
  private loadFromStorage(): PanierState {
    if (!isPlatformBrowser(this.platformId)) {
      // ✅ Retourner état vide côté serveur
      return {
        lignes: [],
        totalArticles: 0,
        nombreProduits: 0,
        montantTotal: 0
      };
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }

    return {
      lignes: [],
      totalArticles: 0,
      nombreProduits: 0,
      montantTotal: 0
    };
  }
}
