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
  prixUnitaire: number; // ⚠️ Ajouté pour correspondre au backend
  dateDebut: string; // Format: YYYY-MM-DD
  dateFin: string;
  observations?: string;
}

export interface ValidationDevisDto {
  idReservation?: number;
  accepter: boolean;
  motifRefus?: string;
}

// ============ DTOs DE RÉPONSE ============

export interface DisponibiliteResponseDto {
  disponible: boolean;
  quantiteDisponible: number;
  message?: string;
}

export interface ReservationResponseDto {
  idReservation: number;
  referenceReservation: string;
  idUtilisateur: number;
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient: number;
  dateDebut: string;
  dateFin: string;
  dateCreation: string;
  statutReservation: StatutReservation;
  statutLivraisonRes?: string;
  montantOriginal: number;
  remisePourcentage?: number;
  remiseMontant?: number;
  montantTotal: number;
  montantPaye?: number;
  montantRestant: number;
  lignesReservation: LigneReservationResponseDto[];
  observationsClient?: string;
  commentaireAdmin?: string;
  estDevis: boolean;
  paiementComplet: boolean;
  nombreProduits: number;
  joursLocation: number;
}

export interface LigneReservationResponseDto {
  idLigneReservation: number;
  idProduit: number;
  nomProduit: string;
  quantite: number;
  prixUnitaire: number;
  dateDebut: string;
  dateFin: string;
  sousTotal: number;
  typeProduit: TypeProduit;
  observations?: string;
  numerosSeries?: string[];
  imageProduit?: string;
  codeProduit?: string;
  statutLivraisonLigne?: string;
}

// ============ ENUMS ============

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
  | 'EN_ATTENTE'
  | 'EN_COURS'
  | 'LIVREE'
  | 'RETOURNEE'
  | 'ANNULEE';
