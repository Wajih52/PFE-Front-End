export interface NotificationResponse {
  idNotification: number;
  typeNotification: TypeNotification;
  typeLibelle: string;
  typeIcone: string;
  titre: string;
  message: string;
  dateCreation: string;
  lue: boolean;
  dateLecture?: string;
  idReservation?: number;
  idLivraison?: number;
  idPaiement?: number;
  idProduit?: number;
  urlAction?: string;
  idUtilisateur: number;
  nomUtilisateur: string;
  prenomUtilisateur: string;
}

export enum TypeNotification {
  // Notifications clients
  RESERVATION_CONFIRMEE = 'RESERVATION_CONFIRMEE',
  DEVIS_VALIDE = 'DEVIS_VALIDE',
  DEVIS_EXPIRE = 'DEVIS_EXPIRE',
  LIVRAISON_PREVUE = 'LIVRAISON_PREVUE',
  LIVRAISON_EN_COURS = 'LIVRAISON_EN_COURS',
  LIVRAISON_EFFECTUEE = 'LIVRAISON_EFFECTUEE',
  RETOUR_PREVU = 'RETOUR_PREVU',
  PAIEMENT_RECU = 'PAIEMENT_RECU',
  PAIEMENT_EN_ATTENTE = 'PAIEMENT_EN_ATTENTE',
  PAIEMENT_RETARD = 'PAIEMENT_RETARD',
  PAIEMENT_RESUFE='PAIEMENT_REFUSE',

  // Notifications admin/employés
  NOUVELLE_RESERVATION = 'NOUVELLE_RESERVATION',
  NOUVEAU_DEVIS = 'NOUVEAU_DEVIS',
  NOUVEAU_PAIEMENT = 'NOUVEAU_PAIEMENT',
  LIVRAISON_A_EFFECTUER = 'LIVRAISON_A_EFFECTUER',
  RETOUR_EN_RETARD = 'RETOUR_EN_RETARD',
  STOCK_CRITIQUE = 'STOCK_CRITIQUE',
  NOUVELLE_RECLAMATION = 'NOUVELLE_RECLAMATION',

  // Notifications système
  SYSTEME_INFO = 'SYSTEME_INFO',
  SYSTEME_ALERTE = 'SYSTEME_ALERTE'
}

export interface NotificationCount {
  count: number;
}
