// src/app/core/models/produit.enums.ts

/**
 * Énumérations pour la gestion des produits
 * Correspondant aux enums Java du backend
 */




/**
 * Catégories de produits
 */
export enum Categorie {
 LUMIERE = 'LUMIERE',
 MOBILIER = 'MOBILIER',
 DECORATION = 'DECORATION',
 ACCESSOIRES = 'ACCESSOIRES',
 STRUCTURE = 'STRUCTURE',
 SONORISATION ='SONORISATION',
 MATERIEL_RESTAURATION='MATERIEL_RESTAURATION'
}

/**
 * Types de produits (avec ou sans référence)
 */
export enum TypeProduit {
  AVEC_REFERENCE = 'AVEC_REFERENCE',    // Ex: projecteur, caméra (numéro de série)
  EN_QUANTITE = 'EN_QUANTITE'     // Ex: chaise, assiette (quantité globale)
}

/**
 * etatd des instances des produits
 */
export enum EtatPhysique {
  NEUF='NEUF',               // État neuf
  BON_ETAT='BON_ETAT',           // Bon état général
  ETAT_MOYEN='ETAT_MOYEN',         // Quelques traces d'usure
  USAGE='USAGE',              // Usé mais fonctionnel
  ENDOMMAGE='ENDOMMAGE'       // Endommagé, nécessite réparation
}

/**
 * Statut d'une instance de produit
 */
export enum StatutInstance {
  DISPONIBLE = 'DISPONIBLE',
  RESERVE = 'RESERVE',
  EN_LIVRAISON = 'EN_LIVRAISON',
  EN_RETOUR = 'EN_RETOUR',
  EN_MAINTENANCE = 'EN_MAINTENANCE',
  HORS_SERVICE = 'HORS_SERVICE',
  PERDU = 'PERDU',
  EN_UTILISATION = 'EN_UTILISATION'
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
  CORRECTION_STOCK = 'CORRECTION_STOCK',
  CREATION = 'CREATION',
  REACTIVATION = 'REACTIVATION',
  ENTREE_STOCK ='ENTREE_STOCK',
  RETOUR_RESERVATION = 'RETOUR_RESERVATION',
  DESACTIVATION = 'DESACTIVATION',
  SORTIE_RESERVATION='SORTIE_RESERVATION',

}

/**
 * Labels français pour l'affichage
 */
export const CategorieLabels: Record<Categorie, string> = {
  [Categorie.MOBILIER]: 'Mobilier',
  [Categorie.DECORATION]: 'Décoration',
  [Categorie.LUMIERE]: 'Lumiere',
  [Categorie.ACCESSOIRES] : 'Accessoires',
    [Categorie.STRUCTURE]: 'Structure',
  [Categorie.SONORISATION]: 'Sonorisation',
  [Categorie.MATERIEL_RESTAURATION]: 'Materiel Restauration',
};

export const EtatPhysiqueLabels: Record<EtatPhysique, string> = {
  [EtatPhysique.NEUF] : 'Neuf',
  [EtatPhysique.BON_ETAT] : 'Bon Etat',
  [EtatPhysique.ETAT_MOYEN] :'Etat Moyen',
  [EtatPhysique.USAGE]: 'Usage',
  [EtatPhysique.ENDOMMAGE]:'Endommagé'
}
export const TypeProduitLabels: Record<TypeProduit, string> = {
  [TypeProduit.AVEC_REFERENCE]: 'Avec Référence',
  [TypeProduit.EN_QUANTITE]: 'En Quantité'
};

export const StatutInstanceLabels: Record<StatutInstance, string> = {
  [StatutInstance.DISPONIBLE]: 'Disponible',
  [StatutInstance.RESERVE]: 'Réservé',
  [StatutInstance.EN_LIVRAISON]: 'En Livraison',
  [StatutInstance.EN_RETOUR]: 'En Retour',
  [StatutInstance.EN_MAINTENANCE]: 'En Maintenance',
  [StatutInstance.HORS_SERVICE]: 'Hors Service',
  [StatutInstance.PERDU]: 'Perdu',
  [StatutInstance.EN_UTILISATION]:'En Utilisation'
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
  [TypeMouvement.CORRECTION_STOCK]: 'Correction de stock',
  [TypeMouvement.CREATION] : 'Creation',
  [TypeMouvement.REACTIVATION] : 'Réactivation',
  [TypeMouvement.ENTREE_STOCK] :'Entrée Stock',
  [TypeMouvement.RETOUR_RESERVATION] : 'Retour Reservation',
  [TypeMouvement.DESACTIVATION] : 'Désactivation',
  [TypeMouvement.SORTIE_RESERVATION] :'Sorite Reservation ',
};
