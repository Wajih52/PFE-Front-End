// src/app/core/models/pointage.model.ts

import { StatutPointage } from './pointage.enums';

/**
 * DTO de requête pour créer/modifier un pointage
 */
export interface PointageRequest {
  dateTravail: string; // Format: YYYY-MM-DD
  heureDebut?: string; // Format: HH:mm:ss
  heureFin?: string; // Format: HH:mm:ss
  statutPointage?: StatutPointage;
  description?: string;
  idUtilisateur?: number; // Pour admin/manager qui crée pour un employé
}

/**
 * DTO de réponse pour un pointage
 */
export interface PointageResponse {
  idPointage: number;
  dateTravail: string;
  heureDebut?: string;
  heureFin?: string;
  statutPointage: StatutPointage;
  totalHeures?: number;
  description?: string;

  // Informations utilisateur
  idUtilisateur: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;
  pseudoUtilisateur: string;
  poste?: string;

  // Indicateurs
  estEnRetard: boolean;
  minutesRetard?: number;
  estComplet: boolean; // heureDebut && heureFin présents
}

/**
 * Statistiques de pointage
 */
export interface StatistiquesPointage {
  idUtilisateur: number;
  nomComplet: string;
  poste?: string;

  // Statistiques du mois/période
  joursPresents: number;
  joursAbsents: number;
  joursEnRetard: number;
  joursEnConge: number;

  // Heures de travail
  totalHeuresTravaillees: number;
  moyenneHeuresParJour: number;

  // Taux (en pourcentage)
  tauxPresence: number;
  tauxRetard: number;

  // Retards
  totalRetards: number;
  totalMinutesRetard?: number;

  // Période
  periodeDebut: string;
  periodeFin: string;
}
