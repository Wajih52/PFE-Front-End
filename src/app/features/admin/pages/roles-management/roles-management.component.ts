// src/app/features/admin/pages/roles-management/roles-management.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoleService } from '../../../../services/role.service';
import {RoleResponse, RoleRequest, UserResponse} from '../../../../core/models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import {MenuNavigationComponent} from '../menu-navigation/menu-navigation.component';

@Component({
  selector: 'app-roles-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './roles-management.component.html',
  styleUrls: ['./roles-management.component.scss']
})
export class RolesManagementComponent implements OnInit {
  // Données
  roles: RoleResponse[] = [];
  filteredRoles: RoleResponse[] = [];
  selectedRole: RoleResponse | null = null;
  usersForSelectedRole: any[] = [];

  // Statistiques
  stats = {
    total: 0,
    actifs: 0,
    inactifs: 0,
    recentlyAdded: 0
  };

  // États UI
  isLoading = false;
  searchTerm = '';
  showAddModal = false;
  showEditModal = false;
  showUsersModal = false;
  isSubmitting = false;

  // Messages
  successMessage = '';
  errorMessage = '';

  // Formulaires
  roleForm!: FormGroup;
  editForm!: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  get paginatedRoles(): RoleResponse[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRoles.slice(start, start + this.itemsPerPage);
  }
  get totalPages(): number {
    return Math.ceil(this.filteredRoles.length / this.itemsPerPage);
  }

  // Tri
  sortColumn: string = 'nom';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private roleService: RoleService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  /**
   * Initialiser les formulaires
   */
  initForms(): void {
    this.roleForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });

    this.editForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  /**
   * Charger tous les rôles
   */
  loadRoles(): void {
    this.isLoading = true;
    this.roleService.getAllRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.filteredRoles = [...data];
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rôles:', error);
        this.showError('Erreur lors du chargement des rôles');
        this.isLoading = false;
      }
    });
  }

  /**
   * Calculer les statistiques
   */
  calculateStats(): void {
    this.stats.total = this.roles.length;
    this.stats.actifs = this.roles.filter(r => r.active).length;
    this.stats.inactifs = this.roles.filter(r => !r.active).length;

    // Rôles ajoutés dans les 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.stats.recentlyAdded = this.roles.filter(r =>
      new Date(r.creationDate) >= thirtyDaysAgo
    ).length;
  }

  /**
   * Appliquer les filtres de recherche
   */
  applyFilters(): void {
    let filtered = [...this.roles];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(role =>
        role.nom.toLowerCase().includes(term) ||
        (role.description && role.description.toLowerCase().includes(term))
      );
    }

    this.filteredRoles = filtered;
    this.currentPage = 1;
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Tri des colonnes
   */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredRoles.sort((a: any, b: any) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Ouvrir le modal d'ajout
   */
  openAddModal(): void {
    this.roleForm.reset();
    this.showAddModal = true;
    this.clearMessages();
  }

  /**
   * Fermer le modal d'ajout
   */
  closeAddModal(): void {
    this.showAddModal = false;
    this.roleForm.reset();
    this.clearMessages();
  }

  /**
   * Sauvegarder un nouveau rôle
   */
  saveRole(): void {
    if (this.roleForm.invalid) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;
    const roleData: RoleRequest = this.roleForm.value;

    this.roleService.createRole(roleData).subscribe({
      next: (response) => {
        this.showSuccess('Rôle créé avec succès !');
        this.loadRoles();
        setTimeout(() => this.closeAddModal(), 1500);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la création du rôle:', error);
        this.showError(error.error?.message || 'Erreur lors de la création du rôle');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Ouvrir le modal d'édition
   */
  openEditModal(role: RoleResponse): void {
    this.selectedRole = role;
    this.editForm.patchValue({
      nom: role.nom,
      description: role.description
    });
    this.showEditModal = true;
    this.clearMessages();
  }

  /**
   * Fermer le modal d'édition
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedRole = null;
    this.editForm.reset();
    this.clearMessages();
  }

  /**
   * Sauvegarder les modifications d'un rôle
   */
  updateRole(): void {
    if (this.editForm.invalid || !this.selectedRole) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;
    const roleData: RoleRequest = this.editForm.value;

    this.roleService.updateRole(this.selectedRole.id, roleData).subscribe({
      next: (response) => {
        this.showSuccess('Rôle modifié avec succès !');
        this.loadRoles();
        setTimeout(() => this.closeEditModal(), 1500);
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Erreur lors de la modification du rôle:', error);
        this.showError(error.error?.message || 'Erreur lors de la modification du rôle');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Supprimer un rôle
   */
  deleteRole(role: RoleResponse): void {
    this.confirmationService.confirm({
      title :  'Confirmer la suppression',
      message :  `Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`,
      confirmText : 'Supprimer',
      type : 'danger'
    }).then((confirmed) => {
      if (confirmed) {
        this.roleService.deleteRole(role.id).subscribe({
          next: () => {
            this.showSuccess('Rôle supprimé avec succès !');
            this.loadRoles();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression du rôle:', error);
            this.showError(error.error?.message || 'Erreur lors de la suppression du rôle');
          }
        });
      }
    });
  }

  /**
   * Afficher les utilisateurs d'un rôle
   */
  showUsersForRole(role: RoleResponse): void {
    this.selectedRole = role;
    this.isLoading = true;

    this.roleService.getUsersByRole(role.id).subscribe({
      next: (data) => {
        this.usersForSelectedRole = data;
        this.showUsersModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.showError('Erreur lors du chargement des utilisateurs');
        this.isLoading = false;
      }
    });
  }

  /**
   * Fermer le modal des utilisateurs
   */
  closeUsersModal(): void {
    this.showUsersModal = false;
    this.selectedRole = null;
    this.usersForSelectedRole = [];
  }

  /**
   * Navigation pagination
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Obtenir le message d'erreur pour un champ
   */
  getErrorMessage(fieldName: string, form: FormGroup): string {
    const control = form.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    return '';
  }

  /**
   * Formater la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
//========================================
  /**
   * Obtenir l'URL complète de l'image
   */
  getImageUrl(imagePath: string | undefined): string {

    if (!imagePath) {
      return 'assets/images/default-avatar.png';
    }

    // Si l'image commence déjà par http, c'est une URL complète
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Si c'est un chemin relatif, ajouter l'URL de base du backend
    return `http://localhost:8080${imagePath}`;
  }

  /**
   * Gérer les erreurs de chargement d'image
   */
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-avatar.png';
  }

  // Variables pour le clique image
  selectedImage: string = '';
  showImageModal: boolean = false;

  /**
   * Ouvrir le modal d'image agrandie
   */
  openImageModal(imageUrl: string): void {
    this.selectedImage = this.getImageUrl(imageUrl);
    this.showImageModal = true;
  }

  isZoomed: boolean = false;
  /**
   * Fermer le modal d'image agrandie
   */
  closeImageModal(): void {
    this.showImageModal = false;
    this.selectedImage = '';
  }

  /**
   * Télécharger l'image
   */
  downloadImage(imageUrl: string): void {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `profile-${new Date().getTime()}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  //=============================================================
  /**
   * Afficher un message de succès
   */
  showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  /**
   * Afficher un message d'erreur
   */
  showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => this.clearMessages(), 5000);
  }

  /**
   * Effacer les messages
   */
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
