// src/app/core/models/produit.model.ts

import { Categorie, TypeProduit } from './produit.enums';

/**
 * Requête de création/modification de produit (ProduitRequestDto.java)
 */
export interface ProduitRequest {
  nom: string;
  description?: string;
  categorie: Categorie;
  typeProduit: TypeProduit;
  prixUnitaire: number;
  quantiteDisponible?: number;  // Pour produits SANS_REFERENCE
  seuilCritique?: number;       // Seuil d'alerte de stock
  image?: string;               // Base64
}

/**
 * Réponse produit (ProduitResponseDto.java)
 */
export interface ProduitResponse {
  idProduit: number;
  codeProduit: string;
  nomProduit: string;
  descriptionProduit?: string;
  categorieProduit: Categorie;
  typeProduit: TypeProduit;
  prixUnitaire: number;
  quantiteDisponible: number;
  quantiteReservee: number;
  seuilCritique: number;
  image?: string;
  estActif: boolean;
  dateCreation: string;         // ISO 8601
  dateModification: string;     // ISO 8601
  ajoutePar?: string;
  modifiePar?: string;

  // Champs calculés (si TypeProduit = AVEC_REFERENCE)
  nombreInstancesDisponibles?: number;
  nombreInstancesReservees?: number;
  nombreInstancesEnMaintenance?: number;
  nombreInstancesHorsService?: number;
}

/**
 * Statistiques de stock (StockStatistiquesDto.java)
 */
export interface StockStatistiques {
  totalProduits: number;
  produitsDisponibles: number;
  produitsEnRupture: number;
  produitsStockCritique: number;
  valeurTotaleStock: number;
  mouvements30Jours: number;
}
