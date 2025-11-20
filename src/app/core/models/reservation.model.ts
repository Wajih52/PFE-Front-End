// src/app/core/models/reservation.model.ts
// Modèles pour les réservations et devis

// ============ DTOs DE REQUÊTE ============

export interface VerificationDisponibiliteDto {
  idProduit: number;
  quantite: number;
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
}

export interface DevisRequestDto {
  lignesReservation: LigneReservationRequestDto[];
  observationsClient?: string;
  validationAutomatique: boolean; // ⭐ true = commande directe, false = devis
}

export interface LigneReservationRequestDto {
  idProduit: number;
  quantite: number;
 // prixUnitaire: number; // ⚠️ Ajouté pour correspondre au backend
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
  observations?: string;
}

export interface ValidationDevisDto {
  idReservation?: number;
  accepter: boolean;
  motifRefus?: string;
}

/**
 * DTO pour modification devis par l'ADMIN
 * Correspond à: DevisModificationDto.java
 */
export interface DevisModificationDto {
  idReservation: number;
  lignesModifiees?: LigneModificationDto[];
  remisePourcentage?: number; // Entre 0 et 100
  remiseMontant?: number;
  commentaireAdmin?: string;
}

/**
 * DTO pour une ligne modifiée (dans le devis admin)
 * Correspond à: LigneModificationDto.java
 */
export interface LigneModificationDto {
  idLigneReservation: number;
  nouveauPrixUnitaire?: number;
  nouvelleQuantite?: number;
}

/**
* DTO pour recherche avancée de réservations
*/
export interface ReservationSearchDto {
  idUtilisateur?: number;
  statut?: StatutReservation;
  dateDebutMin?: string; // Format: YYYY-MM-DD
  dateDebutMax?: string;
  referenceReservation?: string;
  nomClient?: string;
  emailClient?: string;
  montantMin?: number;
  montantMax?: number;
}

/**
 * DTO pour valider une période de dates
 * Correspond à: DatePeriodeDto.java
 */
export interface DatePeriodeDto {
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
}

// ============================================
// DTOs DE MODIFICATION DE DATES
// ============================================
/**
 * Modifier une seule ligne de réservation
 */
export interface ModifierUneLigneRequestDto {
  nouvelleDateDebut: string; // Format: YYYY-MM-DD
  nouvelleDateFin: string;
  motif?: string;
}

/**
 * Décaler toutes les lignes d'une réservation
 */
export interface DecalerToutesLignesRequestDto {
  nombreJours: number; // +7 pour avancer, -7 pour reculer
  motif: string; // Obligatoire
}

/**
 * Réponse de modification de dates
 */
export interface ModificationDatesResponseDto {
  reservation: ReservationResponseDto;
  ancienneDateDebut: string;
  ancienneDateFin: string;
  ancienMontantTotal: number;
  nouveauMontantTotal: number;
  detailsModifications: DetailLigneModifiee[];
  message: string;
}
export interface DetailLigneModifiee {
  idLigne: number;
  nomProduit: string;
  ancienneDateDebut: string;
  ancienneDateFin: string;
  nouvelleDateDebut: string;
  nouvelleDateFin: string;
  ancienMontant: number;
  nouveauMontant: number;
}
export interface ModifierDatesReservationDto {
  idReservation: number;
  nouvelleDateDebut: string; // Format: YYYY-MM-DD
  nouvelleDateFin: string;
  motifModification?: string;
}


// ============================================
// DTOs DE RÉPONSE
// ============================================

export interface DisponibiliteResponseDto {
  idProduit: number;
  nomProduit: string;
  disponible: boolean;
  quantiteDemandee: number;
  quantiteDisponible: number;
  message?: string;
  instancesDisponibles?: string[]; // Pour produits avec référence
}

export interface ReservationResponseDto {
  // Identifiants
  idReservation: number;
  referenceReservation: string; // Ex: RES-2025-001

// Client
  idUtilisateur: number;
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient: number;


  // Dates (Format ISO: yyyy-MM-dd)
  dateDebut: string;
  dateFin: string;
  dateCreation: string; // Format ISO: yyyy-MM-ddTHH:mm:ss

  // Statut
  statutReservation: StatutReservation;
  statutLivraisonRes?: StatutLivraison;

  // Montants
  montantOriginal: number;
  remisePourcentage?: number;
  remiseMontant?: number;
  montantTotal: number;
  montantPaye?: number;
  montantRestant: number;

  // Paiement
  modePaiementRes?: ModePaiement;

  // Lignes de réservation (produits)
  lignesReservation: LigneReservationResponseDto[]

  // Observations
  observationsClient?: string;
  commentaireAdmin?: string;

  // Indicateurs
  estDevis: boolean; // true si EN_ATTENTE (devis non confirmé)
  paiementComplet: boolean; // true si montantPaye >= montantTotal
  nombreProduits: number; // Nombre total de produits
  joursLocation: number; // Durée en jours
}

/**
 * DTO de réponse pour une ligne de réservation
 * Correspond à: LigneReservationResponseDto.java
 */
export interface LigneReservationResponseDto {
  idLigneReservation: number;
  idProduit: number;
  nomProduit: string;
  codeProduit?: string;
  imageProduit?: string;

  quantite: number;
  prixUnitaire: number;
  sousTotal: number;

  dateDebut: string;
  dateFin: string;

  statutLivraisonLigne?: string;
  typeProduit: TypeProduit;
  observations?: string;

  // Pour les produits avec référence: liste des instances réservées
  numerosSeries?: string[]; // Ex: ["PROJ-2025-001", "PROJ-2025-002"]


  // Infos de livraison si assignée
  idLivraison?: number;
  titreLivraison?: string;


}

export interface VerificationModificationDatesDto {
  possible: boolean;
  message: string;
  nombreJours?: number;
  detailsProduits?: DetailDisponibiliteProduitDto[];
}

/**
 * Détail de disponibilité pour un produit
 */
export interface DetailDisponibiliteProduitDto {
  idProduit: number;
  nomProduit: string;
  disponible: boolean;
  message?: string;
}

/**
 * DTO de réponse pour la vérification de disponibilité
 * Correspond à: DisponibiliteResponseDto.java
 */
export interface DisponibiliteResponseDto {
  idProduit: number;
  nomProduit: string;
  disponible: boolean;
  quantiteDemandee: number;
  quantiteDisponible: number;
  message?: string;
  instancesDisponibles?: string[]; // Pour produits avec référence
}

//-------------------------------------------------------
/**
 * Modifier plusieurs lignes spécifiques
 */
export interface ModifierPlusieursLignesRequestDto {
  modifications: ModificationLigneDto[];
}

export interface ModificationLigneDto {
  idLigne: number;
  nouvelleDateDebut: string;
  nouvelleDateFin: string;
  motif?: string;
}


// ============================================
// ENUMS
// ============================================


export type StatutReservation =
  | 'EN_ATTENTE'
  | 'CONFIRME'
  | 'ANNULE'
  | 'EN_COURS'
  | 'TERMINE';

export type TypeProduit =
  | 'EN_QUANTITE'
  | 'AVEC_REFERENCE';

export type StatutLivraison =
  |'NOT_TODAY'
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'LIVREE'
  |'RETOUR'
  |'RETOUR_PARTIEL'
  | 'RETOURNEE'
  | 'ANNULEE';

export type StatutPaiementRes =
  | 'EN_ATTENTE_PAIEMENT'
  | 'PARTIELLEMENT_PAYE'
  | 'TOTALEMENT_PAYE'



export enum ModePaiement {
  ESPECES = 'ESPECES',
  D17 = 'D17',
  VIREMENT = 'VIREMENT'
}

// ============================================
// LABELS ET HELPERS
// ============================================

export const StatutReservationLabels: Record<StatutReservation, string> = {
  'EN_ATTENTE': 'En attente',
  'CONFIRME': 'Confirmée',
  'ANNULE': 'Annulée',
  'EN_COURS': 'En cours',
  'TERMINE': 'Terminée'
};

export const StatutLivraisonLabels: Record<StatutLivraison, string> = {
  'NOT_TODAY':'Pas Aujourd\'hui',
  'EN_ATTENTE': 'En attente',
  'EN_COURS': 'En cours',
  'LIVREE': 'Livrée',
  'RETOURNEE': 'Retournée',
  'ANNULEE': 'Annulée',
  'RETOUR_PARTIEL': 'Retour Partiel',
  'RETOUR':'Retour'
};

export const ModePaiementLabels: Record<ModePaiement, string> = {
  [ModePaiement.ESPECES]: 'Espèces',
  [ModePaiement.D17]: 'D17',
  [ModePaiement.VIREMENT]: 'Virement bancaire'
};

export const StatutPaiementResLabels: Record<StatutPaiementRes, string> = {
  'EN_ATTENTE_PAIEMENT': 'En attente Paiement',
  'PARTIELLEMENT_PAYE': 'Partiellement Payé',
  'TOTALEMENT_PAYE': 'Totalement Payé',
};







