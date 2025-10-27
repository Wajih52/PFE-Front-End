// src/app/core/services/role.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleRequest, RoleResponse } from '../core/models';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private baseUrl = 'http://localhost:8080/roles';
  private userRoleUrl = 'http://localhost:8080/utilisateur-roles';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les rôles
   */
  getAllRoles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(`${this.baseUrl}/afficheRoles`);
  }

  /**
   * Récupérer un rôle par ID
   */
  getRoleById(id: number): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(`${this.baseUrl}/afficheUnRole/${id}`);
  }

  /**
   * Créer un nouveau rôle
   */
  createRole(roleRequest: RoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(`${this.baseUrl}/ajoutRole`, roleRequest);
  }

  /**
   * Modifier un rôle
   */
  updateRole(id: number, roleRequest: RoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.baseUrl}/modifierRole/${id}`, roleRequest);
  }

  /**
   * Supprimer un rôle
   */
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/supprimerRole/${id}`);
  }

  /**
   * Récupérer les utilisateurs associés à un rôle
   */
  getUsersByRole(roleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.userRoleUrl}/roles/${roleId}`);
  }
}
