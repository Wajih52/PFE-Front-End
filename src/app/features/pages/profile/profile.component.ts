// src/app/features/pages/profile/profile.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../../core/services/storage.service';
import { ImageService } from '../../../core/services/image.service';
import {AuthService} from '../../../core/services/auth.service';
import {Router} from '@angular/router';
import {ConfirmationService} from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private imageService = inject(ImageService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);


  // Formulaires
  profileForm: FormGroup;
  passwordForm: FormGroup;

  // Données
  user: any = null;
  previewImage: string = '';

  // États UI
  isEditingProfile = false;
  isEditingPassword = false;
  isLoadingProfile = false;
  isLoadingImage = false;
  isLoadingPassword = false;

  // Messages
  successMessage = '';
  errorMessage = '';

  // États
  isLoggingOut = false;
  isLoading = true;

  API_URL = 'http://localhost:8080/utilisateurs';

  constructor() {
    // Formulaire profil (sans image, sans mot de passe)
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      genre: [''],
      telephone: ['', Validators.required],
      adresse: [''],
      bio: ['', Validators.maxLength(500)]
    });

    // Formulaire mot de passe
    this.passwordForm = this.fb.group({
      ancienMotDePasse: ['', Validators.required],
      nouveauMotDePasse: ['', [Validators.required, Validators.minLength(8)]],
      confirmMotDePasse: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }


  /**
   * Déconnexion de l'utilisateur
   */
  async logout() {
    const confirmed = await this.confirmationService.confirm({
      title: '👋 Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      confirmText: 'Oui, me déconnecter',
      type: 'info'
    });
    if(!confirmed) return ;
    if (confirmed) {
      this.isLoggingOut = true;

      this.authService.logout().subscribe({
        next: () => {
          console.log('✅ Déconnexion réussie');
          this.router.navigate(['/auth/login'], {
            queryParams: { logout: 'true' }
          });
        },
        error: (error) => {
          console.error('❌ Erreur de déconnexion', error);
          // Déconnecter quand même côté client
          this.storage.clear();
          this.router.navigate(['/auth/login']);
        },
        complete: () => {
          this.isLoggingOut = false;
        }
      });
    }
  }
  /**
   * Charger le profil depuis le backend
   */
  loadProfile(): void {
    const userId = this.storage.getUser()?.idUtilisateur;

    this.http.get(`${this.API_URL}/${userId}`).subscribe({
      next: (data: any) => {
        this.user = data;

        if (data.image) {
          this.previewImage = `http://localhost:8080${data.image}`;
        } else {
          this.previewImage = '';
        }

        this.profileForm.patchValue(data);
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger le profil';
        console.error(err);
      }
    });
  }

  /**
   * Sélectionner une nouvelle image
   */
  async onFileSelect(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = '❌ Veuillez sélectionner une image';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = '❌ Image trop volumineuse (max 5MB)';
      return;
    }

    try {
      // Compresser et obtenir le Base64
      this.previewImage = await this.imageService.compressImage(file);
      this.errorMessage = '';

      // Sauvegarder automatiquement
      this.saveImage();
    } catch (error) {
      this.errorMessage = '❌ Erreur lors du traitement de l\'image';
      console.error(error);
    }
  }

  /**
   * Sauvegarder l'image (endpoint dédié)
   */
  saveImage(): void {
    this.isLoadingImage = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.patch(`${this.API_URL}/${this.user.idUtilisateur}/image`, {
      image: this.previewImage
    }).subscribe({
      next: (response: any) => {
        this.successMessage = '✅ Photo mise à jour';
        this.user.image = response.image;
        if (response.image) {
          this.previewImage = `http://localhost:8080${response.image}`;
        }

        // Mettre à jour le localStorage
        const currentUser = this.storage.getUser();
        if (currentUser) {
          currentUser.image = response.image;
          this.storage.saveUser(currentUser);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la sauvegarde de l\'image';
        console.error(err);
      },
      complete: () => {
        this.isLoadingImage = false;
      }
    });
  }

  /**
   * Supprimer l'image
   */
 async deleteImage() {
    const confirmed = await this.confirmationService.confirm({
      title: '🗑️ Supprimer la photo',
      message: 'Voulez-vous vraiment supprimer votre photo de profil ?',
      confirmText: 'Supprimer',
      type: 'danger'
    });
    if(!confirmed) return ;

    this.isLoadingImage = true;

    this.http.patch(`${this.API_URL}/${this.user.idUtilisateur}/image`, {
      image: null
    }).subscribe({
      next: () => {
        this.successMessage = '✅ Photo supprimée';
        this.user.image = null;
        this.previewImage = '';

        const currentUser = this.storage.getUser();

        if (currentUser) {
          currentUser.image = undefined;
          this.storage.saveUser(currentUser);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la suppression';
      },
      complete: () => {
        this.isLoadingImage = false;
      }
    });
  }

  /**
   * Modifier le profil (endpoint PATCH classique)
   */
  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.isLoadingProfile = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data = this.profileForm.value;

    this.http.patch(`${this.API_URL}/modifierPartiel/${this.user.idUtilisateur}`, data).subscribe({
      next: (response: any) => {
        this.successMessage = '✅ Profil mis à jour';
        this.isEditingProfile = false;
        this.user = { ...this.user, ...response };

        const currentUser = this.storage.getUser();
        if (currentUser) {
          this.storage.saveUser({ ...currentUser, ...response });
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour';
        console.error(err);
        this.isLoadingProfile = false;
      },
      complete: () => {
        this.isLoadingProfile = false;
      }
    });
  }

  /**
   * Changer le mot de passe (endpoint dédié)
   */
  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const { nouveauMotDePasse, confirmMotDePasse } = this.passwordForm.value;

    if (nouveauMotDePasse !== confirmMotDePasse) {
      this.errorMessage = '❌ Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoadingPassword = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data = {
      ancienMotDePasse: this.passwordForm.value.ancienMotDePasse,
      nouveauMotDePasse: this.passwordForm.value.nouveauMotDePasse
    };

    this.http.post(`${this.API_URL}/${this.user.idUtilisateur}/change-password`, data).subscribe({
      next: () => {
        this.successMessage = '✅ Mot de passe modifié avec succès';
        this.passwordForm.reset();
        this.isEditingPassword = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du changement de mot de passe';
        console.error(err);
      },
      complete: () => {
        this.isLoadingPassword = false;
      }
    });
  }

  async deactivateAccount() {
    const confirmed = await this.confirmationService.confirm({
      title: '⚠️ Désactiver le compte',
      message: 'Votre compte sera désactivé et vous serez déconnecté. Vous pourrez le réactiver en vous reconnectant.',
      confirmText: 'Désactiver',
      cancelText: 'Annuler',
      type: 'danger'
    });
    if (!confirmed) return;

    this.http.post(`${this.API_URL}/${this.user.idUtilisateur}/desactiver`, {}).subscribe({
      next: () => {
        alert('✅ Compte désactivé. Vous allez être déconnecté.');
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: () => {
            this.storage.clear();
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la désactivation';
      }
    });
  }

  async supprimerAccount() {
    const confirmed = await this.confirmationService.confirm({
      title: '⚠️ Supprimer le compte',
      message: 'Votre compte sera Supprimer et vous serez déconnecté. Vous ne pourrez plus se connecter par la suite ',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });
    if (!confirmed) return;

    this.http.post(`${this.API_URL}/${this.user.idUtilisateur}/archiver`, {}).subscribe({
      next: () => {
        alert('✅ Compte Supprimé. Vous allez être déconnecté.');
        this.authService.logout().subscribe({
          next: () => this.router.navigate(['/auth/login']),
          error: () => {
            this.storage.clear();
            this.router.navigate(['/auth/login']);
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de la Suppression';
      }
    });
  }

  /**
   * Obtenir les initiales pour l'avatar
   */
  getUserInitials(): string {
    if (!this.user) return '?';
    const prenom = this.user.prenom?.charAt(0) || '';
    const nom = this.user.nom?.charAt(0) || '';
    return (prenom + nom).toUpperCase();
  }

  /**
   * Utilitaires
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(formName: 'profile' | 'password', fieldName: string): boolean {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
