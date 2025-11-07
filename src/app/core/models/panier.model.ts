// src/app/core/models/panier.model.ts

//import { LocalDate } from './reservation.model';

/**
 * Ligne dans le panier (avant création du devis)
 */
export interface LignePanier {
  idProduit: number;
  nomProduit: string;
  prixUnitaire: number;
  quantite: number;
  dateDebut: string; // Format ISO: YYYY-MM-DD
  dateFin: string;   // Format ISO: YYYY-MM-DD
  imageProduit?: string;
  categorie?: string;
  sousTotal: number; // Calculé: quantite × prixUnitaire × nbJours
  nbJours: number;   // Calculé: dateFin - dateDebut + 1
  disponible?: boolean; // Vérification temps réel
}

/**
 * État du panier complet
 */
export interface PanierState {
  lignes: LignePanier[];
  totalArticles: number;
  montantTotal: number;
  observationsClient?: string;
}

/**
 * Options pour la validation du panier
 */
export interface ValidationPanierOptions {
  validationAutomatique: boolean; // true = commande directe, false = devis
  observationsClient?: string;
}

/**
 * Résultat de vérification de disponibilité
 */
export interface VerificationDisponibiliteResult {
  disponible: boolean;
  quantiteDisponible: number;
  message?: string;
}
