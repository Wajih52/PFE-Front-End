// src/app/core/models/produit.model.ts (VERSION FINALE CORRIGÉE)

import { Categorie, TypeProduit } from './produit.enums';

/**
 * Requête de création/modification de produit (ProduitRequestDto.java)
 * ⚠️ Les noms des champs correspondent EXACTEMENT au backend
 */
export interface ProduitRequest {
  nomProduit: string;
  descriptionProduit: string;
  categorieProduit: Categorie;
  prixUnitaire: number;
  quantiteInitial: number;
  typeProduit: TypeProduit;
  maintenanceRequise?: boolean;      // Optionnel, défaut: false
  imageProduit?: string;             // Base64
  seuilCritique?: number;            // Optionnel
}

/**
 * Réponse produit (ProduitResponseDto.java)
 * ⚠️ Correspondance EXACTE avec le backend
 */
export interface ProduitResponse {
  // Champs principaux
  idProduit: number;
  codeProduit: string;
  nomProduit: string;
  descriptionProduit: string;
  imageProduit?: string;
  categorieProduit: Categorie;
  prixUnitaire: number;
  quantiteInitial: number;
  quantiteDisponible: number;
  maintenanceRequise: boolean;
  typeProduit: TypeProduit;
  seuilCritique: number;

  // Indicateurs (calculés par le backend)
  enStock: boolean;                   // true si quantiteDisponible > 0
  alerteStockCritique: boolean;       // true si stock <= seuilCritique

  // Statistiques (optionnelles)
  nombreReservations?: number;
  moyenneNotes?: number;              // Note moyenne (0-5)
  nombreAvis?: number;

  // Dates
  dateCreation?: string;               // Date (ISO format)
  dateDerniereModification?: string;   // Date (ISO format)
}

/**
 * Statistiques de stock (StockStatistiquesDto.java)
 */
export interface StockStatistiques {
  totalEntrees: number;
  totalSorties: number;
  quantiteActuelle: number;
  nombreMouvements: number;
  dateDernierMouvement?: string;      // Date (ISO format)
}
