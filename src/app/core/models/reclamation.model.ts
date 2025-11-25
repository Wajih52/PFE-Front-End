// src/app/core/models/reclamation.model.ts

import { StatutReclamation, TypeReclamation, PrioriteReclamation } from './reclamation.enums';

/**
 * DTO de requête pour créer une réclamation
 */
export interface ReclamationRequest {
  objet: string;
  descriptionReclamation: string;
  contactEmail: string;
  contactTelephone?: string;
  typeReclamation: TypeReclamation;
  idReservation?: number;
}

/**
 * DTO de réponse pour une réclamation
 */
export interface ReclamationResponse {
  idReclamation: number;
  codeReclamation: string;
  dateReclamation: string;
  objet: string;
  descriptionReclamation: string;
  contactEmail: string;
  contactTelephone?: string;
  statutReclamation: StatutReclamation;
  typeReclamation: TypeReclamation;
  prioriteReclamation: PrioriteReclamation;

  // Réponse
  reponse?: string;
  dateReponse?: string;
  traitePar?: string;

  // Informations utilisateur
  idUtilisateur?: number;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;

  // Informations réservation
  idReservation?: number;
  codeReservation?: string;
}

/**
 * DTO pour traiter une réclamation
 */
export interface TraiterReclamationDto {
  statutReclamation: StatutReclamation;
  prioriteReclamation: PrioriteReclamation;
  reponse: string;
}

/**
 * DTO pour classer une réclamation
 */
export interface ClasserReclamationDto {
  statutReclamation: StatutReclamation;
  prioriteReclamation: PrioriteReclamation;
}

/**
 * Statistiques des réclamations
 */
export interface ReclamationStatistiques {
  enAttente: number;
  enCours: number;
  resolu: number;
  urgentesNonTraitees: number;
}
