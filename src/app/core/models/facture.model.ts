export enum TypeFacture {
  DEVIS = 'DEVIS',
  PRO_FORMA = 'PRO_FORMA',
  FINALE = 'FINALE'
}

export enum StatutFacture {
  EN_ATTENTE_VALIDATION_CLIENT = 'EN_ATTENTE_VALIDATION_CLIENT',
  EN_ATTENTE_LIVRAISON = 'EN_ATTENTE_LIVRAISON',
  A_REGLER = 'A_REGLER',
  PAYEE = 'PAYEE',
  ANNULEE = 'ANNULEE'
}

export interface FactureResponse {
  idFacture: number;
  numeroFacture: string;
  typeFacture: TypeFacture;
  statutFacture: StatutFacture;

  dateCreation: string; // ISO DateTime
  dateEcheance?: string; // ISO Date

  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  montantRemise?: number;

  notes?: string;
  conditionsPaiement?: string;
  cheminPDF?: string;

  // Infos réservation
  idReservation: number;
  referenceReservation: string;

  // Infos client
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  telephoneClient?: string;

  generePar: string;
}

export interface GenererFactureRequest {
  idReservation: number;
  typeFacture: TypeFacture;
  notes?: string;
  conditionsPaiement?: string;
}

// Labels pour l'affichage
export const TypeFactureLabels: Record<TypeFacture, string> = {
  [TypeFacture.DEVIS]: 'Devis',
  [TypeFacture.PRO_FORMA]: 'Pro-forma',
  [TypeFacture.FINALE]: 'Facture Finale'
};

export const StatutFactureLabels: Record<StatutFacture, string> = {
  [StatutFacture.EN_ATTENTE_VALIDATION_CLIENT]: 'En attente de validation',
  [StatutFacture.EN_ATTENTE_LIVRAISON]: 'En attente de livraison',
  [StatutFacture.A_REGLER]: 'À régler',
  [StatutFacture.PAYEE]: 'Payée',
  [StatutFacture.ANNULEE]: 'Annulée'
};

export const StatutFactureBadgeClasses: Record<StatutFacture, string> = {
  [StatutFacture.EN_ATTENTE_VALIDATION_CLIENT]: 'badge-warning',
  [StatutFacture.EN_ATTENTE_LIVRAISON]: 'badge-info',
  [StatutFacture.A_REGLER]: 'badge-danger',
  [StatutFacture.PAYEE]: 'badge-success',
  [StatutFacture.ANNULEE]: 'badge-secondary'
};

// Fonctions utilitaires
export function formatMontantTND(montant: number): string {
  return `${montant.toFixed(2)} TND`;
}

export function formatDateFacture(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
