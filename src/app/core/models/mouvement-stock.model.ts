// src/app/core/models/mouvement-stock.model.ts

import { TypeMouvement } from './produit.enums';

/**
 * Réponse mouvement de stock (MouvementStockResponseDto.java)
 */
export interface MouvementStockResponse {
  idMouvement: number;
  dateMouvement: string;        // ISO 8601
  typeMouvement: TypeMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  motif?: string;
  effectuePar?: string;

  // Informations du produit
  idProduit: number;
  nomProduit: string;
  codeProduit: string;

  // Informations instance (si mouvement sur instance)
  idInstance?: number;
  numeroSerie?: string;
  codeInstance?: string;

  // Informations réservation
  idReservation?: number;
}
