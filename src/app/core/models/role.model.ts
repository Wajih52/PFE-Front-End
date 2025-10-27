/**
 * Requête de création/modification de rôle (RoleRequestDto.java)
 */
export interface RoleRequest {
  nom: string;
  description?: string;
}

/**
 * Réponse rôle (RoleResponseDto.java)
 */
export interface RoleResponse {
  id: number;
  nom: string;
  description?: string;
  creationDate: Date;
  modificationDate: Date;
  active: boolean;
}
