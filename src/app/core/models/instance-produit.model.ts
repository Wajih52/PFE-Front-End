// src/app/core/models/instance-produit.model.ts

import {EtatPhysique, StatutInstance} from './produit.enums';

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
  etatPhysique:EtatPhysique;

  // Informations du produit parent
  idProduit: number;
  nomProduit: string;
  codeProduit: string;
  // Informations de réservation (si réservé)
  idLigneReservation?: number;
  numeroReservation?: string;
  clientReservation?: string;
  observation?: string;
  dateAcquisition: string;
  dateModification?: string;
  ajoutPar?: string;
  modifiePar?: string;


  // Informations de maintenance (si en maintenance)
  motif?: string;

  // Informations de la ligne de réservation (si réservée)

 idReservation:number;
 clientNom:string;
 clientPrenom:string;

  dateDerniereMaintenance:string
  dateProchaineMaintenance:string;

  // Indicateurs
  disponible:string;
   maintenanceRequise:string;
  joursAvantMaintenance:number; // Nombre de jours avant la prochaine maintenance

}

