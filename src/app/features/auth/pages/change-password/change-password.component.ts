// src/app/features/auth/pages/change-password/change-password.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {StorageService} from '../../../../core/services/storage.service'
import {variables} from '../../../../core/environement/variables'

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute);

  changePasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  activationToken: string | null = null;



  constructor() {
    this.changePasswordForm = this.fb.group({
      ancienMotDePasse: [''],
      nouveauMotDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/)
      ]],
      confirmationMotDePasse: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // 1. Vérifier si on arrive depuis le lien d'invitation (mode Activation par Token)
    this.activationToken = this.route.snapshot.queryParamMap.get('token');
    // 2. Si PAS de token, rederige vers login
    if (!this.activationToken) {
      this.router.navigate(['/auth/login']);
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('nouveauMotDePasse')?.value;
    const confirmPassword = group.get('confirmationMotDePasse')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.changePasswordForm.invalid) {
      this.markFormGroupTouched(this.changePasswordForm);
      return;
    }

    this.isLoading = true;

    if (this.activationToken) {
    const payload = {
      token: this.activationToken,
      nouveauMotDePasse: this.changePasswordForm.value.nouveauMotDePasse
    };

    this.http.post(`${variables.apiUrl}/utilisateurs/activer-compte`, payload).subscribe({
      next: () => {
        this.successMessage = 'Compte activé avec succès ! Redirection vers la connexion...';
        this.isLoading = false;

        // Rediriger vers page connexion après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Lien invalide ou expiré';
        this.isLoading = false;
      }
    });
  }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    const isFieldInvalid = !!(field && field.invalid && field.touched);


    // Si on vérifie le champ de confirmation, on regarde aussi l'erreur du groupe
    if (fieldName === 'confirmationMotDePasse') {
      const hasMismatch = this.changePasswordForm.hasError('passwordMismatch');
      return isFieldInvalid || !!(hasMismatch && field?.touched);
    }

    return isFieldInvalid;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (fieldName === 'nouveauMotDePasse') {
      if (field?.hasError('minlength')) {
        return 'Le mot de passe doit contenir au moins 8 caractères';
      }
      if (field?.hasError('pattern')) {
        return 'Le mot de passe doit contenir: 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial';
      }
    }

    if (fieldName === 'confirmationMotDePasse' && this.changePasswordForm.hasError('passwordMismatch')) {
      return 'Les mots de passe ne correspondent pas';
    }

    return '';
  }

  getPasswordStrength(): string {
    const password = this.changePasswordForm.get('nouveauMotDePasse')?.value;
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&.#_-]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }
}
