// src/app/features/admin/pages/users-management/users-management.component.ts

import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import {ImageService} from '../../../../core/services/image.service';
import {ManageUserRolesModalComponent} from '../manage-user-roles-modal/manage-user-roles-modal.component';
import {
  LucideAngularModule,
  UsersRound, UserPlus, ShieldX, ShieldCheck, ShieldMinus, Eye, FileUser, Trash2, FilePenLine} from 'lucide-angular';
import{variables} from '../../../../core/environement/variables';

interface User {
  idUtilisateur: number;
  codeUtilisateur: string;
  nom: string;
  prenom: string;
  pseudo: string;
  email: string;
  telephone: number;
  genre?: string;
  adresse?: string;
  image?: string;
  etatCompte: string;
  roles: string[];
  poste?: string;
  dateEmbauche?: string;
  dateFinContrat?: string;
  statutEmploye?: string;
  bio?: string;
  dateCreation?: string;
}

interface Stats {
  total: number;
  actifs: number;
  suspendus: number;
  desactives: number;
}

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ManageUserRolesModalComponent, LucideAngularModule],
  providers: [DatePipe],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit {

  @ViewChild('manageRolesModal') manageRolesModal!:ManageUserRolesModalComponent ;
  private http = inject(HttpClient);
  private confirmationService = inject(ConfirmationService);
  private fb = inject(FormBuilder);
  private imageService = inject(ImageService);
  private datePipe = inject(DatePipe);

  API_URL = `${variables.apiUrl}/utilisateurs`;
  IMAGE_BASE_URL = `${variables.apiImg}`;

  //icone lucide
  readonly UsersRound = UsersRound;
  readonly UserPlus = UserPlus;
  readonly ShieldX = ShieldX;
  readonly ShieldCheck = ShieldCheck;
  readonly ShieldMinus = ShieldMinus;
  readonly Eye = Eye;
  readonly FileUser = FileUser;
  readonly Trash2 = Trash2;
  readonly FilePenLine = FilePenLine;


  // Données
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;

  // Statistiques
  stats: Stats = { total: 0, actifs: 0, suspendus: 0, desactives: 0 };

  // Recherche et filtres
  searchTerm = '';
  filterRole = '';
  filterStatut = '';
  filterPoste = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Tri
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // UI
  showDetailsModal = false;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Formulaire d'édition
  showEditModal = false;
  editForm!: FormGroup;
  isSubmitting = false;

  // Après les autres propriétés du modal edit
  editPreviewImage: string = '';
  editSelectedImageFile: File | null = null;

  // Stockage des rôles de l'utilisateur en cours d'édition
  currentUserRoles: string[] = [];

  // Messages d'erreur et succès spécifiques au modal d'édition
  editErrorMessage = '';
  editSuccessMessage = '';

  // Formulaire d'ajout
  showAddModal = false;
  addForm!: FormGroup;
  isSubmittingAdd = false;
  addErrorMessage = '';
  addSuccessMessage = '';



  ngOnInit(): void {
    this.loadUsers();
    this.initAddForm();
  }

  /**
   * Charger tous les utilisateurs
   */
  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<User[]>(`${this.API_URL}/all`).subscribe({
      next: (data) => {
        this.allUsers = data;
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  /**
   * Appliquer recherche et filtres
   */
  applyFilters(): void {
    let result = [...this.allUsers];

    // Recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(u => {
        const nom = u.nom?.toLowerCase() ?? '';
        const prenom = u.prenom?.toLowerCase() ?? '';
        const pseudo = u.pseudo?.toLowerCase() ?? '';
        const email = u.email?.toLowerCase() ?? '';
        const code = u.codeUtilisateur?.toLowerCase() ?? '';
        const telephone = u.telephone?.toString() ?? '';

        return nom.includes(term) ||
          prenom.includes(term) ||
          pseudo.includes(term) ||
          email.includes(term) ||
          code.includes(term) ||
          telephone.includes(term);
      });
    }

    // Filtre rôle
    if (this.filterRole) {
      result = result.filter(u => u.roles.includes(this.filterRole));
    }

    // Filtre statut
    if (this.filterStatut) {
      result = result.filter(u => u.etatCompte === this.filterStatut);
    }

    // Filtre poste
    if (this.filterPoste) {
      result = result.filter(u => u.poste === this.filterPoste);
    }

    this.filteredUsers = result;
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  /**
   * Calculer statistiques
   */
  calculateStats(): void {
    this.stats.total = this.allUsers.length;
    this.stats.actifs = this.allUsers.filter(u => u.etatCompte === 'ACTIVE').length;
    this.stats.suspendus = this.allUsers.filter(u => u.etatCompte === 'SUSPENDU').length;
    this.stats.desactives = this.allUsers.filter(u => u.etatCompte === 'DESACTIVE').length;
  }

  /**
   * Obtenir utilisateurs de la page courante
   */
  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredUsers.slice(start, end);
  }

  /**
   * Navigation pagination
   */
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  /**
   * Tri colonne
   */
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a: any, b: any) => {
      let valA = a[column];
      let valB = b[column];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Réinitialiser filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatut = '';
    this.filterPoste = '';
    this.applyFilters();
  }

  /**
   * Afficher détails
   */
  showDetails(user: User): void {
    this.selectedUser = user;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedUser = null;
  }

  //  Méthode pour obtenir l'URL complète de l'image
  getImageUrl(imagePath?: string): string {

    if (!imagePath) return 'assets/images/default-avatar.png';

    // Si l'image commence déjà par http, la retourner telle quelle
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Sinon, construire l'URL complète
    return `${this.IMAGE_BASE_URL}${imagePath}`;
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
//======================================================
  //  Méthode pour formater les dates
  formatDate(date?: string): string {
    if (!date) return 'N/A';

    // Si la date est une chaîne ISO ou timestamp
    try {
      return this.datePipe.transform(date, 'dd/MM/yyyy à HH:mm') || 'N/A';
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Obtenir la classe CSS du statut
   */
  getStatutClass(statut: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'statut-actif',
      'SUSPENDU': 'statut-suspendu',
      'DESACTIVE': 'statut-desactive',
      'ARCHIVE': 'statut-archive'
    };
    return classes[statut] || '';
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatutIcon(statut: string): string {
    const icons: { [key: string]: string } = {
      'ACTIVE': 'check_box',
      'SUSPENDU': 'block',
      'DESACTIVE': 'disabled_by_default',
      'ARCHIVE': 'archive'
    };
    return icons[statut] || '❓';
  }

  /**
   * Obtenir les rôles uniques pour le filtre
   */
  get uniqueRoles(): string[] {
    const roles = new Set<string>();
    this.allUsers.forEach(user => {
      user.roles.forEach(role => roles.add(role));
    });
    return Array.from(roles).sort();
  }

  /**
   * Obtenir les postes uniques pour le filtre
   */
  get uniquePostes(): string[] {
    const postes = new Set<string>();
    this.allUsers.forEach(user => {
      if (user.poste) postes.add(user.poste);
    });
    return Array.from(postes).sort();
  }

  /**
   * Suspendre compte
   */
  async suspendAccount(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: '⛔ Suspendre le compte',
      message: `Voulez-vous suspendre le compte de ${user.prenom} ${user.nom} ?`,
      confirmText: 'Suspendre',
      type: 'warning'
    });

    if (!confirmed) return;

    this.http.patch(`${this.API_URL}/${user.idUtilisateur}/suspendre`, {}).subscribe({
      next: () => {
        this.successMessage = ` Compte de ${user.prenom} ${user.nom} suspendu`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suspension';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  /**
   * Désactiver compte
   */
  async deactivateAccount(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: ' Désactiver le compte',
      message: `Voulez-vous désactiver le compte de ${user.prenom} ${user.nom} ?`,
      confirmText: 'Désactiver',
      type: 'warning'
    });

    if (!confirmed) return;

    this.http.post(`${this.API_URL}/${user.idUtilisateur}/desactiver`, {}).subscribe({
      next: () => {
        this.successMessage = ` Compte de ${user.prenom} ${user.nom} désactivé`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la désactivation';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  /**
   * Activer compte
   */
  async activateAccount(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: ' Activer le compte',
      message: `Voulez-vous activer le compte de ${user.prenom} ${user.nom} ?`,
      confirmText: 'Activer',
      type: 'info'
    });

    if (!confirmed) return;

    this.http.post(`${this.API_URL}/${user.idUtilisateur}/activer`, {}).subscribe({
      next: () => {
        this.successMessage = ` Compte de ${user.prenom} ${user.nom} activé`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l\'activation';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  /**
   * Supprimer utilisateur
   */
  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: ' Supprimer définitivement',
      message: `ATTENTION : Voulez-vous supprimer définitivement ${user.prenom} ${user.nom} ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      type: 'danger'
    });

    if (!confirmed) return;

    this.http.delete(`${this.API_URL}/${user.idUtilisateur}`, {
      responseType: 'text'
    }).subscribe({
      next: () => {
        this.successMessage = ` Utilisateur ${user.prenom} ${user.nom} supprimé`;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }


  /**
   * Sélectionner une image pour l'édition
   */
  async onEditImageSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.editErrorMessage = ' Veuillez sélectionner une image';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.editErrorMessage = ' Image trop volumineuse (max 5MB)';
      return;
    }

    try {
      this.editErrorMessage = '';
      // Compresser et obtenir le Base64
      this.editPreviewImage = await this.imageService.compressImage(file);
      this.editSelectedImageFile = file;
    } catch (error) {
      this.editErrorMessage = ' Erreur lors du traitement de l\'image';
      console.error(error);
    }
  }

  /**
   * Supprimer l'image sélectionnée
   */
  clearEditImage(): void {
    this.editPreviewImage = '';
    this.editSelectedImageFile = null;
  }

  /**
   * Sauvegarder uniquement l'image
   */
  saveImage(): void {
    if (!this.editPreviewImage || !this.editForm.value.idUtilisateur) {
      this.editErrorMessage = ' Aucune image sélectionnée';
      return;
    }

    const userId = this.editForm.value.idUtilisateur;

    this.http.patch(`${this.API_URL}/${userId}/image`, { image: this.editPreviewImage }).subscribe({
      next: (response : any) => {
        this.editSuccessMessage = ' Image mise à jour avec succès';

        //  Mettre à jour dans la liste
        const userIndex = this.allUsers.findIndex(u => u.idUtilisateur === userId);
        if (userIndex !== -1) {
          this.allUsers[userIndex] = { ...this.allUsers[userIndex], image: response.image };
        }

        // Mettre à jour le formulaire d'édition (pour l'aperçu)
        this.editForm.patchValue({ image: response.image + '?t=' + new Date().getTime() });

        //  Réinitialiser la sélection
        this.editPreviewImage = '';
        this.editSelectedImageFile = null;

        //  Réappliquer les filtres pour mettre à jour la vue
        this.applyFilters();

        setTimeout(() => this.editSuccessMessage = '', 3000);
      },
      error: (err) => {
        this.editErrorMessage = err.error?.message || '❌ Erreur lors de la mise à jour de l\'image';
        setTimeout(() => this.editErrorMessage = '', 5000);
      }
    });
  }



  /**
   * Ouvre le modal de gestion des rôles pour un utilisateur
   */
  openManageRolesModal(utilisateur: any): void {
    // Passer l'utilisateur au modal et l'ouvrir

    if (!this.manageRolesModal) {
      console.error('❌ Le modal n\'est pas initialisé !');
      return;
    }

    if (!utilisateur || !utilisateur.idUtilisateur) {
      console.error('❌ Utilisateur invalide ou sans ID:', utilisateur);
      return;
    }

    this.manageRolesModal.utilisateurId = utilisateur.idUtilisateur;
    this.manageRolesModal.utilisateurPseudo = utilisateur.pseudo;


    console.log('✅ Valeurs assignées au modal:');
    console.log('   - utilisateurId:', this.manageRolesModal.utilisateurId);
    console.log('   - utilisateurPseudo:', this.manageRolesModal.utilisateurPseudo);

    this.manageRolesModal.open();
  }

  /**
   * Callback appelé quand les rôles sont mis à jour
   */
  onRolesUpdated(): void {
    // Optionnel : recharger la liste des utilisateurs si nécessaire
    this.loadUsers();
    console.log('Rôles mis à jour avec succès');
  }


  /**
   * Initialiser le formulaire d'ajout
   */
  initAddForm(): void {
    this.addForm = this.fb.group({
      nom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      prenom: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      pseudo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(100)
      ]],
      telephone: ['', [
        Validators.required,
        Validators.min(10000000),
        Validators.max(999999999999999)
      ]],
      genre: ['', [
        Validators.required,
        Validators.pattern(/^(Homme|Femme|Autre)$/)
      ]],
      adresse: ['', [Validators.maxLength(200)]],
      bio: ['', [Validators.maxLength(500)]],
      motDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/)
      ]],
      etatCompte: ['ACTIVE', Validators.required],
      role: ['', Validators.required],
      poste: ['', [Validators.maxLength(100)]],
      dateEmbauche: [null],
      dateFinContrat: [null],
      statutEmploye: [''],
      image: ['']
    });
  }

  /**
   * Ouvrir le modal d'ajout
   */
  openAddModal(): void {
    this.addForm.reset({
      nom: '',
      prenom: '',
      pseudo: '',
      email: '',
      telephone: '',
      genre: '',
      adresse: '',
      bio: '',
      motDePasse: '',
      etatCompte: 'ACTIVE',
      role: '', // Reset à vide
      poste: '',
      dateEmbauche: '',
      dateFinContrat: '',
      statutEmploye: '',
      image: ''
    });
    this.previewImage = ''; // Reset l'image preview
    this.showAddModal = true;
    this.addErrorMessage = '';
    this.addSuccessMessage = '';
  }
  /**
   * Fermer le modal d'ajout
   */
  closeAddModal(): void {
    this.showAddModal = false;
    this.addErrorMessage = '';
    this.addSuccessMessage = '';
  }

  /**
   * Vérifier si le rôle EMPLOYE ou ADMIN est sélectionné
   */
  isAddFormEmployeOrAdmin(): boolean {
    const role = this.addForm?.get('role')?.value;
    return role === 'EMPLOYE' || role === 'ADMIN';
  }

  /**
   * Sauvegarder un nouvel utilisateur
   */
  saveNewUser(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      this.addErrorMessage = ' Veuillez corriger les erreurs dans le formulaire';
      setTimeout(() => this.addErrorMessage = '', 5000);
      return;
    }

    this.isSubmittingAdd = true;
    this.addErrorMessage = '';
    this.addSuccessMessage = '';


    // Préparer les données pour l'envoi
    const newUser = {
      ...this.addForm.value,
      // Convertir le téléphone en number
      telephone: Number(this.addForm.value.telephone),
      // Convertir les dates si elles existent
      dateEmbauche: this.addForm.value.dateEmbauche ? new Date(this.addForm.value.dateEmbauche) : null,
      dateFinContrat: this.addForm.value.dateFinContrat ? new Date(this.addForm.value.dateFinContrat) : null,
      // Pour statutEmploye, envoyer null si vide
      statutEmploye: this.addForm.value.statutEmploye || null,
      // Envoyer l'image compressée si elle existe
      image: this.previewImage && this.previewImage.startsWith('data:image') ? this.previewImage : null
    };

    console.log('Données envoyées:', newUser); // Pour debug

    this.http.post(`${this.API_URL}/ajouter`, newUser).subscribe({
      next: () => {
        this.addSuccessMessage = ' Utilisateur créé avec succès';
        this.loadUsers();
        this.isSubmittingAdd = false;

        setTimeout(() => {
          this.showAddModal = false;
          this.addSuccessMessage = '';
          this.successMessage = ' Nouvel utilisateur créé avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }, 1500);
      },
      error: (err) => {
        this.addErrorMessage = err.error?.message || ' Erreur lors de la création';
        this.isSubmittingAdd = false;
        setTimeout(() => this.addErrorMessage = '', 5000);
      }
    });
  }

  previewImage: string = '';
  selectedImageFile: File | null = null;


  /**
   * Sélectionner une image pour l'ajout
   */
  async onAddImageSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.addErrorMessage = ' Veuillez sélectionner une image';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.addErrorMessage = ' Image trop volumineuse (max 5MB)';
      return;
    }

    try {
      this.addErrorMessage = '';
      // Compresser et obtenir le Base64
      this.previewImage = await this.imageService.compressImage(file);
      this.selectedImageFile = file;

      // Mettre à jour le contrôle du formulaire
      this.addForm.patchValue({ image: this.previewImage });
    } catch (error) {
      this.addErrorMessage = ' Erreur lors du traitement de l\'image';
      console.error(error);
    }
  }

  /**
   * Supprimer l'image sélectionnée
   */
  clearAddImage(): void {
    this.previewImage = '';
    this.selectedImageFile = null;
    this.addForm.patchValue({ image: '' });
  }





  /**
   * pour editer profil
   * */
  initEditForm(user: User): void {

    // Stocker les rôles de l'utilisateur
    this.currentUserRoles = user.roles;


    // Réinitialiser l'aperçu
    this.editPreviewImage = '';
    this.editSelectedImageFile = null;

    this.editForm = this.fb.group({
      idUtilisateur: [user.idUtilisateur],
      image: [user.image],
      nom: [user.nom, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: [user.prenom,[Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      pseudo: [user.pseudo,[
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: [user.email, [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
      ]],
      telephone: [user.telephone, [
        Validators.required,
        Validators.min(10000000),
        Validators.max(999999999999999)
      ]],
      genre: [user.genre ||'',Validators.required],
      adresse: [user.adresse,[Validators.maxLength(200)]],
      bio: [user.bio],
      etatCompte: [user.etatCompte, Validators.required],
      roles: [{ value: user.roles, disabled: true }], // Désactivé si CLIENT
      poste: [user.poste],
      dateEmbauche: [user.dateEmbauche],
      dateFinContrat: [user.dateFinContrat],
      statutEmploye: [user.statutEmploye],
    });
  }

  /**
   * Obtenir le texte des rôles formaté pour affichage
   */
  getRolesDisplay(): string {
    return this.currentUserRoles.join(', ');
  }

  /**
   * Obtenir le message d'erreur pour un champ spécifique
   */
  getErrorMessage(fieldName: string, formGroup?: FormGroup): string {
    const form = formGroup || this.editForm;
    const control = form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    // Messages d'erreur pour le nom
    if (fieldName === 'nom') {
      if (errors['required']) return 'Le nom est obligatoire';
      if (errors['minlength']) return `Le nom doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
      if (errors['maxlength']) return `Le nom ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['pattern']) return 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes';
    }

    // Messages d'erreur pour le prénom
    if (fieldName === 'prenom') {
      if (errors['required']) return 'Le prénom est obligatoire';
      if (errors['minlength']) return `Le prénom doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
      if (errors['maxlength']) return `Le prénom ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['pattern']) return 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes';
    }

    // Messages d'erreur pour le pseudo
    if (fieldName === 'pseudo') {
      if (errors['required']) return 'Le pseudo est obligatoire';
      if (errors['minlength']) return `Le pseudo doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
      if (errors['maxlength']) return `Le pseudo ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['pattern']) return 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores';
    }

    // Messages d'erreur pour l'email
    if (fieldName === 'email') {
      if (errors['required']) return 'L\'email est obligatoire';
      if (errors['email']) return 'Format d\'email invalide';
      if (errors['maxlength']) return `L'email ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    }

    // Messages d'erreur pour le téléphone
    if (fieldName === 'telephone') {
      if (errors['required']) return 'Le téléphone est obligatoire';
      if (errors['min']) return 'Le numéro de téléphone doit contenir au moins 8 chiffres';
      if (errors['max']) return 'Le numéro de téléphone est trop long';
    }

    // Messages d'erreur pour le genre
    if (fieldName === 'genre') {
      if (errors['required']) return 'Le genre est obligatoire';
      if (errors['pattern']) return 'Le genre doit être: HOMME, FEMME ou AUTRE';
    }

    // Messages d'erreur pour le mot de passe
    if (fieldName === 'motDePasse') {
      if (errors['required']) return 'Le mot de passe est obligatoire';
      if (errors['minlength']) return `Le mot de passe doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
      if (errors['maxlength']) return `Le mot de passe ne peut pas dépasser ${errors['maxlength'].requiredLength} caractères`;
      if (errors['pattern']) return 'Le mot de passe doit contenir: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial';
    }

    // Messages d'erreur pour le rôle
    if (fieldName === 'role') {
      if (errors['required']) return 'Le rôle est obligatoire';
    }

    return '';
  }


  editUser(user: User): void {
    this.initEditForm(user);
    this.showEditModal = true;
    // Réinitialiser les messages du modal
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
  }

  closeEditModal(): void {
    this.showEditModal = false;
    // Réinitialiser les messages du modal
    this.editErrorMessage = '';
    this.editSuccessMessage = '';
  }

  isEmploye(): boolean {
    return this.editForm?.get('roles')?.value?.includes('EMPLOYE');
  }

  isEmployeOrAdmin(): boolean {
    const roles = this.editForm?.get('roles')?.value || [];
    return roles.includes('EMPLOYE') || roles.includes('ADMIN');
  }

  saveUserChanges(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.editErrorMessage = ' Veuillez remplir tous les champs obligatoires correctement';
      setTimeout(() => this.editErrorMessage = '', 5000);
      return;
    }

    this.isSubmitting = true;
    this.editErrorMessage = '';
    this.editSuccessMessage = '';

    // Récupérer les valeurs en incluant les champs désactivés
    const updatedUser = this.editForm.getRawValue();

    this.http.patch(`${this.API_URL}/modifierPartiel/${updatedUser.idUtilisateur}`, updatedUser).subscribe({
      next: () => {
        this.editSuccessMessage = ' Utilisateur modifié avec succès';
        this.loadUsers();
        this.isSubmitting = false;

        // Fermer le modal après 1.5 secondes
        setTimeout(() => {
          this.showEditModal = false;
          this.editSuccessMessage = '';
          // Afficher le message dans le composant principal
          this.successMessage = 'Utilisateur modifié avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        }, 1500);
      },
      error: (err) => {
        this.editErrorMessage = err.error?.message || '❌ Erreur lors de la mise à jour';
        this.isSubmitting = false;
        setTimeout(() => this.editErrorMessage = '', 5000);
      }
    });
  }



}
