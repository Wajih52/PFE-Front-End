export enum StatutAvis {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
  SIGNALE = 'SIGNALE'
}

export interface AvisCreateDto {
  idReservation: number;
  idProduit: number;
  note: number;
  commentaire?: string;
}

export interface AvisUpdateDto {
  idAvis: number;
  note: number;
  commentaire?: string;
}

export interface AvisModerationDto {
  idAvis: number;
  statut: StatutAvis;
  commentaireModeration?: string;
}

export interface AvisResponseDto {
  idAvis: number;
  note: number;
  commentaire?: string;
  dateAvis: Date;
  statut: StatutAvis;
  visible: boolean;

  // Client
  idClient?: number;
  nomClient: string;
  prenomClient: string;
  emailClient?: string;

  // Produit
  idProduit: number;
  nomProduit: string;
  codeProduit?: string;

  // Réservation
  idReservation?: number;
  numeroReservation?: string;
  dateDebutReservation?: Date;
  dateFinReservation?: Date;

  // Modération
  commentaireModeration?: string;
  dateModeration?: Date;

  // Métadonnées
  peutEtreModifie?: boolean;
  peutEtreSupprime?: boolean;
}

export interface StatistiquesAvisDto {
  idProduit: number;
  nomProduit: string;
  nombreTotalAvis: number;
  nombreAvisApprouves: number;
  nombreAvisEnAttente: number;
  nombreAvisRejetes: number;
  moyenneNotes: number;
  nombre5Etoiles: number;
  nombre4Etoiles: number;
  nombre3Etoiles: number;
  nombre2Etoiles: number;
  nombre1Etoile: number;
  pourcentage5Etoiles: number;
  pourcentage4Etoiles: number;
  pourcentage3Etoiles: number;
  pourcentage2Etoiles: number;
  pourcentage1Etoile: number;
}
