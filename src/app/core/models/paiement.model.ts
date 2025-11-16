export enum StatutPaiement {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REFUSE = 'REFUSE',
  EN_COURS = 'EN_COURS',
  REMBOURSE = 'REMBOURSE'
}

export enum ModePaiement {
  ESPECES = 'ESPECES',
  VIREMENT = 'VIREMENT',
  D17 = 'D17'
}

export interface PaiementRequestDto {
  idReservation: number;
  montantPaiement: number;
  modePaiement: ModePaiement;
  descriptionPaiement?: string;
  referenceExterne?: string;
}

export interface PaiementResponseDto {
  idPaiement: number;
  codePaiement: string;
  idReservation: number;
  referenceReservation: string;
  montantPaiement: number;
  modePaiement: ModePaiement;
  statutPaiement: StatutPaiement;
  datePaiement: string;
  dateValidation?: string;
  descriptionPaiement?: string;
  motifRefus?: string;
  referenceExterne?: string;
  validePar?: string;
  nomClient: string;
  prenomClient: string;
  emailClient: string;
  montantTotalReservation: number;
  montantDejaPayeAvant: number;
  montantRestantApres: number;
  paiementComplet: boolean;
}

export interface RefuserPaiementDto {
  motifRefus: string;
}

export interface MontantPayeReservationDto {
  idReservation: number;
  montantPaye: number;
  paiementComplet: boolean;
}

export interface PaiementCompletDto {
  paiementComplet: boolean;
}

export interface StatistiquesPaiementsDto {
  nombreTotal: number;
  nombreEnAttente: number;
  nombreValides: number;
  nombreRefuses: number;
  montantTotalValide: number;
}

export const StatutPaiementLabels: Record<StatutPaiement, string> = {
  [StatutPaiement.EN_ATTENTE]: 'En attente',
  [StatutPaiement.VALIDE]: 'Validé',
  [StatutPaiement.REFUSE]: 'Refusé',
  [StatutPaiement.EN_COURS]: 'En cours',
  [StatutPaiement.REMBOURSE]: 'Remboursé'
};

export const ModePaiementLabels: Record<ModePaiement, string> = {
  [ModePaiement.ESPECES]: 'Espèces',
  [ModePaiement.VIREMENT]: 'Virement bancaire',
  [ModePaiement.D17]: 'D17'
};

export const StatutPaiementBadgeClasses: Record<StatutPaiement, string> = {
  [StatutPaiement.EN_ATTENTE]: 'badge-warning',
  [StatutPaiement.VALIDE]: 'badge-success',
  [StatutPaiement.REFUSE]: 'badge-danger',
  [StatutPaiement.EN_COURS]: 'badge-info',
  [StatutPaiement.REMBOURSE]: 'badge-secondary'
};

export function formatMontantTND(montant: number): string {
  return `${montant.toFixed(2)} TND`;
}

export function formatDatePaiement(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function calculerPourcentagePaye(montantPaye: number, montantTotal: number): number {
  if (montantTotal === 0) return 0;
  return Math.min(100, (montantPaye / montantTotal) * 100);
}
