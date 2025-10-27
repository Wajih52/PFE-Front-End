// src/app/services/utilisateur-role.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilisateurRoleResponse } from '../models/utilisateur-role-response.model';
import { RoleResponse } from '../core/models';
import { variables } from '../core/environement/variables';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurRoleService {
  private apiUrl = `${variables.apiUrl}/utilisateur-roles`;
  private rolesApiUrl = `${variables.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les rôles d'un utilisateur avec les détails d'attribution
   */
  getRolesWithDetailsByUtilisateur(utilisateurId: number): Observable<UtilisateurRoleResponse[]> {
    return this.http.get<UtilisateurRoleResponse[]>(
      `${this.apiUrl}/utilisateur/${utilisateurId}/details`
    );
  }

  /**
   * Récupère tous les rôles disponibles dans le système
   */
  getAllRolesDisponibles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.rolesApiUrl}/afficheRoles`);
  }

  /**
   * Ajoute un nouveau rôle à un utilisateur
   */
  addRoleToUtilisateur(utilisateurId: number, roleId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/ajoutUtilisateur-Role`,
      null,
      {
        params: {
          idUtilisateur: utilisateurId.toString(),
          idRole: roleId.toString()
        }
      }
    );
  }

  /**
   * Supprime un rôle d'un utilisateur
   */
  deleteUtilisateurRole(idUtilisateurRole: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/supprimerUtilisateur-Roles/${idUtilisateurRole}`
    );
  }

  /**
   * Modifie le rôle d'une relation utilisateur-rôle
   */
  updateUtilisateurRole(idUtilisateurRole: number, newRoleId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/modifierUtilisateur-Role/${idUtilisateurRole}`,
      null,
      {
        params: {
          idRole: newRoleId.toString()
        }
      }
    );
  }
}
