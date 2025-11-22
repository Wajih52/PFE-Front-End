// src/app/core/models/livraison.model.ts

import { StatutLivraison } from './reservation.model';

/**
 * Modèles pour la gestion des livraisons
 * Sprint 6 - Gestion des livraisons
 */

// ============================================
// INTERFACES PRINCIPALES
// ============================================

export interface LivraisonRequestDto {
  titreLivraison: string;
  adresseLivraison: string;
  dateLivraison: string; // Format: YYYY-MM-DD
  heureLivraison: string; // Format: HH:mm:ss
  idLignesReservation: number[];
  observations?: string;
}

export interface LivraisonResponseDto {
  idLivraison: number;
  titreLivraison: string;
  adresseLivraison: string;
  dateLivraison: string;
  heureLivraison: string;
  statutLivraison: StatutLivraison;
  observations?: string;

  dateCreation: string;
  dateModification: string;

  lignesReservation: LigneLivraisonDto[];
  affectations: AffectationLivraisonDto[];
  nomClient: string;
  prenomClient: string;
  notes:string ;
  referenceReservation: string;
  nombreTotalArticles: number;
}

export interface LigneLivraisonDto {
  idLigne: number;
  nomProduit: string;
  quantite: number;
  dateDebut: string;
  dateFin: string;
  statutLivraisonLigne: StatutLivraison;
  typeProduit: string; // 'EN_QUANTITE' ou 'AVEC_REFERENCE'
  instancesReservees?: string[]; // Pour produits avec référence

}

export interface AffectationLivraisonRequestDto {
  idLivraison: number;
  idEmploye: number;
  dateAffectation: string; // Format: YYYY-MM-DD
  heureAffectation: string; // Format: HH:mm:ss
  notes?: string;
}

export interface AffectationLivraisonDto {
  idAffectation: number;
  dateAffectation: string;
  heureAffectation:string;
  notes?: string;
  idEmploye: number;
  nomEmploye: string;
  prenomEmploye: string;
  emailEmploye: string;
  telephoneEmploye: string;
  idLivraison: number;
  titreLivraison: string;
}

// ============================================
// INTERFACES POUR LES FORMULAIRES
// ============================================

export interface LivraisonFormData {
  titre: string;
  adresse: string;
  date: Date;
  heure: string;
  lignesSelectionnees: number[];
  observations?: string;
}

export interface AffectationFormData {
  employe: any; // Utilisateur sélectionné
  dateAffectation: Date;
  heureAffectation: string;
  notes?: string;
}

// ============================================
// LABELS ET HELPERS
// ============================================

export const StatutLivraisonLabels: Record<StatutLivraison, string> = {
  'NOT_TODAY': 'Pas aujourd\'hui',
  'EN_ATTENTE': 'En attente',
  'EN_COURS': 'En cours',
  'LIVREE': 'Livrée',
  'RETOUR': 'Retour',
  'RETOUR_PARTIEL': 'Retour partiel',
  'RETOURNEE': 'Retournée',
  'ANNULEE': 'Annulée'
};

export const StatutLivraisonColors: Record<StatutLivraison, string> = {
  'NOT_TODAY': 'secondary',
  'EN_ATTENTE': 'warning',
  'EN_COURS': 'info',
  'LIVREE': 'success',
  'RETOUR': 'primary',
  'RETOUR_PARTIEL': 'warning',
  'RETOURNEE': 'success',
  'ANNULEE': 'danger'
};

export const StatutLivraisonIcons: Record<StatutLivraison, string> = {
  'NOT_TODAY': 'calendar-x',
  'EN_ATTENTE': 'clock',
  'EN_COURS': 'truck',
  'LIVREE': 'check-circle',
  'RETOUR': 'arrow-left-circle',
  'RETOUR_PARTIEL': 'arrow-left',
  'RETOURNEE': 'check-circle-fill',
  'ANNULEE': 'x-circle'
};

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtenir la classe CSS du badge de statut
 */
export function getStatutLivraisonBadgeClass(statut: StatutLivraison): string {
  return `badge bg-${StatutLivraisonColors[statut]}`;
}

/**
 * Obtenir l'icône du statut
 */
export function getStatutLivraisonIcon(statut: StatutLivraison): string {
  return StatutLivraisonIcons[statut];
}

/**
 * Vérifier si une livraison peut être modifiée
 */
export function canModifierLivraison(livraison: LivraisonResponseDto): boolean {
  return livraison.statutLivraison !== 'LIVREE' &&
    livraison.statutLivraison !== 'RETOURNEE' &&
    livraison.statutLivraison !== 'ANNULEE';
}

/**
 * Vérifier si une livraison peut être supprimée
 */
export function canSupprimerLivraison(livraison: LivraisonResponseDto): boolean {
  return livraison.statutLivraison !== 'LIVREE' &&
    livraison.statutLivraison !== 'RETOURNEE';
}

/**
 * Vérifier si on peut marquer la livraison en cours
 */
export function canMarquerEnCours(livraison: LivraisonResponseDto): boolean {
  return livraison.statutLivraison === 'EN_ATTENTE';
}

/**
 * Vérifier si on peut marquer la livraison comme livrée
 */
export function canMarquerLivree(livraison: LivraisonResponseDto): boolean {
  return livraison.statutLivraison === 'EN_COURS';
}

/**
 * Formatter la date et l'heure pour l'affichage
 */
export function formatDateHeureLivraison(date: string, heure: string): string {
  const dateObj = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return `${dateObj.toLocaleDateString('fr-FR', options)} à ${heure}`;
}

/**
 * Formatter la date de création/modification
 */
export function formatDateTimeAudit(dateTime: string): string {
  const date = new Date(dateTime);
  return date.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}







