// src/app/core/models/calendrier.model.ts

/**
 * Modèles pour la gestion du calendrier
 *
 */

// ============================================
// ÉVÉNEMENTS DU CALENDRIER
// ============================================

export interface CalendrierEvent {
  // Identifiants
  id: number;
  type: 'RESERVATION' | 'LIVRAISON';
  reference: string;

  // Dates
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  heure?: string; // HH:mm

  // Informations
  titre: string;
  description?: string;
  adresse?: string;

  // Statuts et apparence
  statut: string;
  couleur: string;

  // Client
  idClient?: number;
  nomClient?: string;
  prenomClient?: string;
  emailClient?: string;
  telephoneClient?: string;

  // Employé (livraisons)
  idEmploye?: number;
  nomEmploye?: string;
  prenomEmploye?: string;

  // Produits
  nombreProduits?: number;
  produitsResume?: string;

  // Financier (réservations)
  montantTotal?: number;
  montantPaye?: number;
  paiementComplet?: boolean;
}

// ============================================
// FILTRES DU CALENDRIER
// ============================================

export interface CalendrierFiltre {
  // Période
  dateDebut?: string;
  dateFin?: string;

  // Types d'événements
  inclureReservations?: boolean;
  inclureLivraisons?: boolean;

  // Filtres par statut
  statutsReservation?: string[];
  statutsLivraison?: string[];

  // Filtres par entité
  idClient?: number;
  nomClient?: string;
  idEmploye?: number;
  idProduit?: number;
  nomProduit?: string;

  // Autres
  paiementCompletUniquement?: boolean;
  avecRetardPaiement?: boolean;
}

// ============================================
// STATISTIQUES DU CALENDRIER
// ============================================

export interface CalendrierStatistiques {
  nombreReservations: number;
  nombreLivraisons: number;
  montantTotalPeriode: number;
  tauxPaiement: number;
}
