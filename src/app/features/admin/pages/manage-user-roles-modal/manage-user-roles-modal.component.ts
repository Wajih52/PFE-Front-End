// src/app/components/manage-user-roles-modal/manage-user-roles-modal.component.ts

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UtilisateurRoleService } from '../../../../services/utilisateur-role.service';
import { UtilisateurRoleResponse } from '../../../../core/models/utilisateur-role-response.model';
import { RoleResponse } from '../../../../core/models';

@Component({
  selector: 'app-manage-user-roles-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-user-roles-modal.component.html',
  styleUrls: ['./manage-user-roles-modal.component.scss']
})
export class ManageUserRolesModalComponent implements OnInit {
  @Input() utilisateurId!: number;
  @Input() utilisateurPseudo!: string;
  @Output() close = new EventEmitter<void>();
  @Output() rolesUpdated = new EventEmitter<void>();

  isVisible = false;
  isLoading = false;

  // Données
  utilisateurRoles: UtilisateurRoleResponse[] = [];
  allRolesDisponibles: RoleResponse[] = [];
  rolesNonAttribues: RoleResponse[] = [];

  // Formulaire d'ajout
  selectedRoleIdToAdd: number | null = null;

  // Messages
  errorMessage = '';
  successMessage = '';

  constructor(private utilisateurRoleService: UtilisateurRoleService) {}

  ngOnInit(): void {

  }

  /**
   * Ouvre le modal
   */
  open(): void {
    console.log('🔍 DEBUG open() - utilisateurId:', this.utilisateurId);
    console.log('🔍 DEBUG open() - utilisateurPseudo:', this.utilisateurPseudo);

    // ✅ Vérification avant d'ouvrir
    if (!this.utilisateurId) {
      console.error('❌ Impossible d\'ouvrir le modal : utilisateurId est null/undefined');
      return;
    }

    this.isVisible = true;
    this.loadData();  // ✅ Charger les données ICI, pas dans ngOnInit
  }

  /**
   * Ferme le modal
   */
  closeModal(): void {
    this.isVisible = false;
    this.clearMessages();
    this.utilisateurRoles = [];
    this.rolesNonAttribues = [];
    this.selectedRoleIdToAdd = null;
    this.close.emit();
  }

  /**
   * Charge les données initiales
   */
  loadData(): void {

    if (!this.utilisateurId) {
      this.errorMessage = 'Erreur : ID utilisateur manquant';
      console.error('❌ loadData() appelé sans utilisateurId valide');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    // Charger en parallèle les rôles de l'utilisateur et tous les rôles disponibles
    Promise.all([
      this.utilisateurRoleService.getRolesWithDetailsByUtilisateur(this.utilisateurId).toPromise(),
      this.utilisateurRoleService.getAllRolesDisponibles().toPromise()
    ])
      .then(([userRoles, allRoles]) => {
        this.utilisateurRoles = userRoles || [];
        this.allRolesDisponibles = allRoles || [];
        this.updateRolesNonAttribues();
      })
      .catch(error => {
        this.errorMessage = 'Erreur lors du chargement des données';
        console.error('Erreur:', error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  /**
   * Met à jour la liste des rôles non encore attribués à l'utilisateur
   */
  updateRolesNonAttribues(): void {
    const rolesAttribuesIds = this.utilisateurRoles.map(ur => ur.idRole);
    this.rolesNonAttribues = this.allRolesDisponibles.filter(
      role => !rolesAttribuesIds.includes(role.id)
    );
  }

  /**
   * Ajoute un rôle à l'utilisateur
   */
  addRole(): void {
    if (!this.selectedRoleIdToAdd) {
      this.errorMessage = 'Veuillez sélectionner un rôle';
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.utilisateurRoleService
      .addRoleToUtilisateur(this.utilisateurId, this.selectedRoleIdToAdd)
      .subscribe({
        next: () => {
          this.successMessage = 'Rôle ajouté avec succès';
          this.selectedRoleIdToAdd = null;
          this.loadData();
          this.rolesUpdated.emit();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'ajout du rôle';
          this.isLoading = false;
        }
      });
  }

  /**
   * Supprime un rôle de l'utilisateur (avec confirmation)
   */
  deleteRole(utilisateurRole: UtilisateurRoleResponse): void {
    // Vérifier qu'il reste au moins un rôle
    if (this.utilisateurRoles.length <= 1) {
      this.errorMessage = 'L\'utilisateur doit avoir au moins un rôle';
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir retirer le rôle "${utilisateurRole.nomRole}" ?`)) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    this.utilisateurRoleService
      .deleteUtilisateurRole(utilisateurRole.idUtilisateurRole)
      .subscribe({
        next: () => {
          this.successMessage = 'Rôle supprimé avec succès';
          this.loadData();
          this.rolesUpdated.emit();
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la suppression du rôle';
          this.isLoading = false;
        }
      });
  }

  /**
   * Formate la date pour l'affichage
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Efface les messages d'erreur et de succès
   */
  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
