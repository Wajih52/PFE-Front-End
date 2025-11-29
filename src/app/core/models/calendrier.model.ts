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

// ============================================
// CONFIGURATION DU CALENDRIER
// ============================================

export interface CalendrierConfig {
  vueParDefaut: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  locale: string;
  premiereHeureJour: number; // 8h par exemple
  derniereHeureJour: number; // 20h par exemple
  weekendsVisibles: boolean;
  headerToolbar: {
    left: string;
    center: string;
    right: string;
  };
}

// ============================================
// ÉVÉNEMENT FULLCALENDAR (format adapté)
// ============================================

export interface FullCalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  textColor?: string;
  extendedProps: {
    type: 'RESERVATION' | 'LIVRAISON';
    reference: string;
    statut: string;
    client?: string;
    employe?: string;
    produits?: string;
    montant?: number;
    description?: string;
    adresse?: string;
    heure?: string;
    eventData: CalendrierEvent; // Données complètes
  };
}
