// src/app/core/models/instance-produit.model.ts

import { StatutInstance } from './produit.enums';

/**
 * Requête de création/modification d'instance (InstanceProduitRequestDto.java)
 */
export interface InstanceProduitRequest {
  idProduit: number;
  numeroSerie?: string;         // Auto-généré si non fourni
  observation?: string;
  statut?: StatutInstance;      // DISPONIBLE par défaut
}

/**
 * Réponse instance produit (InstanceProduitResponseDto.java)
 */
export interface InstanceProduitResponse {
  idInstance: number;
  numeroSerie: string;
  statut: StatutInstance;
  observation?: string;
  dateAcquisition: string;
  dateModification?: string;
  ajoutPar?: string;
  modifiePar?: string;

  // Informations du produit parent
  idProduit: number;
  nomProduit: string;
  categorieProduit: string;

  // Informations de maintenance (si en maintenance)
  dateDebutMaintenance?: string;
  dateFinPrevueMaintenance?: string;
  motifMaintenance?: string;

  // Informations de réservation (si réservé)
  idLigneReservation?: number;
  numeroReservation?: string;
  clientReservation?: string;
}

