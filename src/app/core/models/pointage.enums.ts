// src/app/core/models/pointage.enums.ts

/**
 * Énumérations pour la gestion des pointages
 */

/**
 * Statut d'un pointage
 */
export enum StatutPointage {
  PRESENT = 'present',
  ABSENT = 'absent',
  EN_RETARD = 'enRetard',
  EN_CONGE = 'enConge'
}

/**
 * Labels français pour l'affichage
 */
export const StatutPointageLabels: Record<StatutPointage, string> = {
  [StatutPointage.PRESENT]: 'Présent',
  [StatutPointage.ABSENT]: 'Absent',
  [StatutPointage.EN_RETARD]: 'En retard',
  [StatutPointage.EN_CONGE]: 'En congé'
};

/**
 * Icônes pour les statuts
 */
export const StatutPointageIcons: Record<StatutPointage, string> = {
  [StatutPointage.PRESENT]: '✅',
  [StatutPointage.ABSENT]: '❌',
  [StatutPointage.EN_RETARD]: '⏰',
  [StatutPointage.EN_CONGE]: '🏖️'
};

/**
 * Couleurs CSS pour les badges de statut
 */
export const StatutPointageColors: Record<StatutPointage, string> = {
  [StatutPointage.PRESENT]: '#27ae60',
  [StatutPointage.ABSENT]: '#e74c3c',
  [StatutPointage.EN_RETARD]: '#f39c12',
  [StatutPointage.EN_CONGE]: '#3498db'
};
