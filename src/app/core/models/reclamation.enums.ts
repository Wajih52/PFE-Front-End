// src/app/core/models/reclamation.enums.ts

/**
 * Énumérations pour la gestion des réclamations
 * Correspondant aux enums Java du backend
 */

/**
 * Statut d'une réclamation
 */
export enum StatutReclamation {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  RESOLU = 'RESOLU',
  REJETE = 'REJETE',
  FERME = 'FERME'
}

/**
 * Type de réclamation
 */
export enum TypeReclamation {
  PRODUIT_ENDOMMAGE = 'PRODUIT_ENDOMMAGE',
  QUANTITE_MANQUANTE = 'QUANTITE_MANQUANTE',
  RETARD_LIVRAISON = 'RETARD_LIVRAISON',
  QUALITE_SERVICE = 'QUALITE_SERVICE',
  PRODUIT_NON_CONFORME = 'PRODUIT_NON_CONFORME',
  PROBLEME_RETOUR = 'PROBLEME_RETOUR',
  FACTURATION = 'FACTURATION',
  AUTRE = 'AUTRE'
}

/**
 * Priorité d'une réclamation
 */
export enum PrioriteReclamation {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}

/**
 * Labels français pour l'affichage
 */
export const StatutReclamationLabels: Record<StatutReclamation, string> = {
  [StatutReclamation.EN_ATTENTE]: 'En attente',
  [StatutReclamation.EN_COURS]: 'En cours',
  [StatutReclamation.RESOLU]: 'Résolu',
  [StatutReclamation.REJETE]: 'Rejeté',
  [StatutReclamation.FERME]: 'Fermé'
};

export const TypeReclamationLabels: Record<TypeReclamation, string> = {
  [TypeReclamation.PRODUIT_ENDOMMAGE]: 'Produit endommagé',
  [TypeReclamation.QUANTITE_MANQUANTE]: 'Quantité manquante',
  [TypeReclamation.RETARD_LIVRAISON]: 'Retard de livraison',
  [TypeReclamation.QUALITE_SERVICE]: 'Qualité du service',
  [TypeReclamation.PRODUIT_NON_CONFORME]: 'Produit non conforme',
  [TypeReclamation.PROBLEME_RETOUR]: 'Problème de retour',
  [TypeReclamation.FACTURATION]: 'Facturation',
  [TypeReclamation.AUTRE]: 'Autre'
};

export const PrioriteReclamationLabels: Record<PrioriteReclamation, string> = {
  [PrioriteReclamation.BASSE]: 'Basse',
  [PrioriteReclamation.MOYENNE]: 'Moyenne',
  [PrioriteReclamation.HAUTE]: 'Haute',
  [PrioriteReclamation.URGENTE]: 'Urgente'
};

/**
 * Couleurs CSS pour les badges de statut
 */
export const StatutReclamationColors: Record<StatutReclamation, string> = {
  [StatutReclamation.EN_ATTENTE]: 'warning',
  [StatutReclamation.EN_COURS]: 'info',
  [StatutReclamation.RESOLU]: 'success',
  [StatutReclamation.REJETE]: 'danger',
  [StatutReclamation.FERME]: 'secondary'
};

/**
 * Couleurs CSS pour les badges de priorité
 */
export const PrioriteReclamationColors: Record<PrioriteReclamation, string> = {
  [PrioriteReclamation.BASSE]: 'secondary',
  [PrioriteReclamation.MOYENNE]: 'info',
  [PrioriteReclamation.HAUTE]: 'warning',
  [PrioriteReclamation.URGENTE]: 'danger'
};
