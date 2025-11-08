// src/app/core/models/mouvement-stock.model.ts

import { TypeMouvement } from './produit.enums';

/**
 * Réponse mouvement de stock (MouvementStockResponseDto.java)
 */
export interface MouvementStockResponse {
  idMouvement: number;
  typeMouvement: TypeMouvement;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  dateMouvement: Date;
  motif: string;
  effectuePar: string;
  idReservation?: number;

  idProduit: number;
  nomProduit: string;
  codeProduit: string;

  // === Informations de l'instance (si applicable) ===
  idInstance?: number;
  numeroSerie?: string;
  codeInstance?: string;

}
