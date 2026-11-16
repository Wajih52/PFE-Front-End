export enum StatutDemandeConge {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REFUSEE = 'REFUSEE'
}

export const StatutDemandeCongeLabels: Record<StatutDemandeConge, string> = {
  [StatutDemandeConge.EN_ATTENTE]: 'En attente',
  [StatutDemandeConge.ACCEPTEE]: 'Acceptée',
  [StatutDemandeConge.REFUSEE]: 'Refusée'
};

export interface DemandeCongeRequest {
  dateDebut: string; // Format YYYY-MM-DD
  dateFin: string;   // Format YYYY-MM-DD
  motif: string;
}

export interface DemandeCongeResponse {
  idDemande: number;
  idUtilisateur: number;
  nomCompletEmploye: string;
  posteEmploye?: string;
  soldeCongesRestant: number;
  dateDebut: string;
  dateFin: string;
  nombreJoursOuvrables: number;
  motif: string;
  statut: StatutDemandeConge;
}
