// src/app/features/auth/pages/reset-password/reset-password.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetPasswordForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  token: string = '';
  tokenValid = true;

  constructor() {
    this.resetPasswordForm = this.fb.group({
      nouveauMotDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/)
      ]],
      confirmMotDePasse: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];

      if (!this.token) {
        this.tokenValid = false;
        this.errorMessage = '❌ Lien invalide ou expiré. Veuillez demander un nouveau lien.';
      }
    });
  }

  /**
   * Validateur personnalisé pour vérifier que les mots de passe correspondent
   */
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('nouveauMotDePasse')?.value;
    const confirmPassword = group.get('confirmMotDePasse')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Soumettre le nouveau mot de passe
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      return;
    }

    this.isLoading = true;

    const data = {
      token: this.token,
      nouveauMotDePasse: this.resetPasswordForm.value.nouveauMotDePasse
    };

    this.authService.resetPassword(data).subscribe({
      next: (response) => {
        console.log('✅ Mot de passe réinitialisé', response);

        this.successMessage = response.message ||
          '✅ Votre mot de passe a été réinitialisé avec succès !';

        // Désactiver le formulaire
        this.resetPasswordForm.disable();

        // Rediriger vers login après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              message: 'Mot de passe modifié ! Vous pouvez vous connecter'
            }
          });
        }, 3000);
      },
      error: (error) => {
        console.error('❌ Erreur', error);

        if (error.error?.message) {
          this.errorMessage = error.error.message;
        }
        // Token expiré ou invalide
        else if (error.status === 400) {
          this.errorMessage = '❌ Lien expiré ou invalide. Veuillez demander un nouveau lien.';
          this.tokenValid = false;
        }
        // Erreur générique
        else {
          this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
        }

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  hasFormError(errorName: string): boolean {
    return !!(this.resetPasswordForm.errors?.[errorName] &&
      this.resetPasswordForm.get('confirmMotDePasse')?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (field?.hasError('minlength')) {
      return 'Minimum 8 caractères';
    }

    if (field?.hasError('pattern')) {
      return '1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial';
    }

    return '';
  }
}
