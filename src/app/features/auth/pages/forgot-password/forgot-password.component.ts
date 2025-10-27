// src/app/features/auth/pages/forgot-password/forgot-password.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  forgotPasswordForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Soumettre la demande de réinitialisation
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.forgotPasswordForm.invalid) {
      this.markFormGroupTouched(this.forgotPasswordForm);
      return;
    }

    this.isLoading = true;

    const data = this.forgotPasswordForm.value;

    this.authService.requestPasswordReset(data).subscribe({
      next: (response) => {
        console.log('✅ Email de réinitialisation envoyé', response);

        this.successMessage = response.message ||
          '✅ Un email de réinitialisation vous a été envoyé. Vérifiez votre boîte mail.';

        // Désactiver le formulaire après succès
        this.forgotPasswordForm.disable();

        // Optionnel : Rediriger vers login après 5 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              message: 'Vérifiez vos emails pour réinitialiser votre mot de passe'
            }
          });
        }, 10000);
      },
      error: (error) => {
        console.error('❌ Erreur', error);

        // ✅ Ajouter ceci en premier
        this.errorMessage = error.error?.message || error.error || 'Erreur lors de l\'envoi';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.forgotPasswordForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (field?.hasError('email')) {
      return 'Format d\'email invalide';
    }

    return '';
  }
}
