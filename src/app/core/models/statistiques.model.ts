// src/app/core/models/statistiques.model.ts

/**
 * Modèles pour les statistiques du dashboard
 */

export interface DashboardStatistiques {
  // ============ KPIs PRINCIPAUX ============
  chiffreAffairesTotal: number;
  chiffreAffairesMoisActuel: number;
  evolutionCAMensuel: number;
  nombreTotalReservations: number;
  nombreReservationsConfirmees: number;
  nombreDevisEnAttente: number;
  nombreClients: number;
  nouveauxClientsMois: number;
  panierMoyen: number;
  tauxConversion: number;

  // ============ ALERTES ============
  produitsStockCritique: number;
  reclamationsEnCours: number;
  paiementsEnRetard: number;
  livraisonsAujourdhui: number;
  retoursAujourdhui: number;

  // ============ GRAPHIQUES ============
  evolutionCA12Mois: MoisChiffreAffaires[];
  repartitionReservationsParStatut: { [statut: string]: number };
  topProduitsLoues: TopProduit[];
  topProduitsCA: TopProduit[];
  caParCategorie: { [categorie: string]: number };
  evolutionReservations12Mois: MoisNombreReservations[];
  moyenneNotesParCategorie: { [categorie: string]: number };

  // ============ STATISTIQUES EMPLOYÉS ============
  nombreEmployesActifs: number;
  tauxPresenceMoyen: number;
  topEmployesLivraisons: TopEmploye[];

  // ============ PÉRIODE ============
  dateDebut: string;
  dateFin: string;
}

export interface MoisChiffreAffaires {
  mois: string;              // "Janvier 2025"
  chiffreAffaires: number;
  annee: number;
  moisNumero: number;        // 1-12
}

export interface MoisNombreReservations {
  mois: string;
  nombreReservations: number;
  annee: number;
  moisNumero: number;
}

export interface TopProduit {
  idProduit: number;
  nomProduit: string;
  codeProduit: string;
  imageProduit?: string;
  nombreLocations: number;
  chiffreAffaires: number;
  moyenneNotes: number;
}

export interface TopEmploye {
  idEmploye: number;
  nomComplet: string;
  email: string;
  nombreLivraisons: number;
  tauxPresence: number;
  imageProfil?: string;
}
