// src/app/core/models/produit.enums.ts

/**
 * Énumérations pour la gestion des produits
 * Correspondant aux enums Java du backend
 */

/**
 * Catégories de produits
 */
export enum Categorie {
 LUMIERE = 'Lumiere',
 MOBILIER = 'Mobilier',
 DECORATION = 'Decoration',
 ACCESSOIRES = 'Accessoires'
}

/**
 * Types de produits (avec ou sans référence)
 */
export enum TypeProduit {
  AVEC_REFERENCE = 'avecReference',    // Ex: projecteur, caméra (numéro de série)
  SANS_REFERENCE = 'enQuantite'     // Ex: chaise, assiette (quantité globale)
}

/**
 * Statut d'une instance de produit
 */
export enum StatutInstance {
  DISPONIBLE = 'DISPONIBLE',
  RESERVE = 'RESERVE',
  EN_LIVRAISON = 'EN_LIVRAISON',
  EN_UTILISATION = 'EN_UTILISATION',
  EN_RETOUR = 'EN_RETOUR',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  HORS_SERVICE = 'HORS_SERVICE',
  PERDU = 'PERDU'
}

/**
 * Types de mouvements de stock
 */
export enum TypeMouvement {
  AJOUT_STOCK = 'AJOUT_STOCK',
  RETRAIT_STOCK = 'RETRAIT_STOCK',
  AJOUT_INSTANCE = 'AJOUT_INSTANCE',
  SUPPRESSION_INSTANCE = 'SUPPRESSION_INSTANCE',
  MAINTENANCE = 'MAINTENANCE',
  RETOUR_MAINTENANCE = 'RETOUR_MAINTENANCE',
  PRODUIT_ENDOMMAGE = 'PRODUIT_ENDOMMAGE',
  RESERVATION = 'RESERVATION',
  ANNULATION_RESERVATION = 'ANNULATION_RESERVATION',
  LIVRAISON = 'LIVRAISON',
  RETOUR = 'RETOUR',
  CORRECTION_STOCK = 'CORRECTION_STOCK'
}

/**
 * Labels français pour l'affichage
 */
export const CategorieLabels: Record<Categorie, string> = {
  [Categorie.MOBILIER]: 'Mobilier',
  [Categorie.DECORATION]: 'Décoration',
  [Categorie.LUMIERE]: 'Lumiere',
  [Categorie.ACCESSOIRES] : 'Accessoires'
};

export const TypeProduitLabels: Record<TypeProduit, string> = {
  [TypeProduit.AVEC_REFERENCE]: 'Avec référence',
  [TypeProduit.SANS_REFERENCE]: 'Sans référence'
};

export const StatutInstanceLabels: Record<StatutInstance, string> = {
  [StatutInstance.DISPONIBLE]: 'Disponible',
  [StatutInstance.RESERVE]: 'Réservé',
  [StatutInstance.EN_LIVRAISON]: 'En livraison',
  [StatutInstance.EN_UTILISATION]: 'En utilisation',
  [StatutInstance.EN_RETOUR]: 'En retour',
  [StatutInstance.EN_MAINTENANCE]: 'En maintenance',
  [StatutInstance.HORS_SERVICE]: 'Hors service',
  [StatutInstance.PERDU]: 'Perdu'
};

export const TypeMouvementLabels: Record<TypeMouvement, string> = {
  [TypeMouvement.AJOUT_STOCK]: 'Ajout de stock',
  [TypeMouvement.RETRAIT_STOCK]: 'Retrait de stock',
  [TypeMouvement.AJOUT_INSTANCE]: 'Ajout d\'instance',
  [TypeMouvement.SUPPRESSION_INSTANCE]: 'Suppression d\'instance',
  [TypeMouvement.MAINTENANCE]: 'Maintenance',
  [TypeMouvement.RETOUR_MAINTENANCE]: 'Retour de maintenance',
  [TypeMouvement.PRODUIT_ENDOMMAGE]: 'Produit endommagé',
  [TypeMouvement.RESERVATION]: 'Réservation',
  [TypeMouvement.ANNULATION_RESERVATION]: 'Annulation de réservation',
  [TypeMouvement.LIVRAISON]: 'Livraison',
  [TypeMouvement.RETOUR]: 'Retour',
  [TypeMouvement.CORRECTION_STOCK]: 'Correction de stock'
};
