// src/app/models/utilisateur-role-response.model.ts

export interface UtilisateurRoleResponse {
  idUtilisateurRole: number;

  // Informations du rôle
  idRole: number;
  nomRole: string;
  descriptionRole: string;

  // Métadonnées d'attribution
  dateAffectationRole: string; // ISO 8601 format
  attribuePar: string;

  // Informations utilisateur (optionnel)
  idUtilisateur?: number;
  pseudoUtilisateur?: string;
}






