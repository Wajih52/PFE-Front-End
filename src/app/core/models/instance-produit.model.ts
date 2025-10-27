// src/app/core/models/instance-produit.model.ts

import { StatutInstance } from './produit.enums';

/**
 * Requête de création/modification d'instance (InstanceProduitRequestDto.java)
 */
export interface InstanceProduitRequest {
  idProduit: number;
  numeroSerie?: string;         // Auto-généré si non fourni
  commentaire?: string;
  statut?: StatutInstance;      // DISPONIBLE par défaut
}

/**
 * Réponse instance produit (InstanceProduitResponseDto.java)
 */
export interface InstanceProduitResponse {
  idInstance: number;
  numeroSerie: string;
  statut: StatutInstance;
  commentaire?: string;
  dateAjout: string;            // ISO 8601
  dateModification?: string;    // ISO 8601
  ajoutePar?: string;
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

/**
 * Demande de maintenance (MaintenanceRequestDto.java)
 */
export interface MaintenanceRequest {
  dateDebutMaintenance: string;  // ISO 8601
  dateFinPrevue: string;         // ISO 8601
  motif: string;
}
