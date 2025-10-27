
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // Injection des dépendances
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formulaire réactif
  registerForm: FormGroup;

  // États de l'UI
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  constructor() {
    // Initialisation du formulaire avec validations
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      pseudo: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/)
      ]],
      motDePasse: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/)
      ]],
      telephone: ['', [
        Validators.required,
        Validators.min(10000000),
        Validators.max(999999999999999)
      ]],
      genre: ['',Validators.required],
      adresse: ['', [Validators.maxLength(200)]]
    });
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    // Réinitialiser les messages
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier si le formulaire est valide
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    // Activer le loader
    this.isLoading = true;

    // Récupérer les valeurs du formulaire
    const userData = {
      ...this.registerForm.value,
      telephone: Number(this.registerForm.value.telephone) // Convertir en nombre
    };

    // Appeler le service d'inscription
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie', response);

        // Afficher le message de succès
        this.successMessage = '✅ Inscription réussie ! Un email d\'activation vous a été envoyé. Vérifiez votre boîte email.';

        // Réinitialiser le formulaire
        this.registerForm.reset();

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              registered: 'true',
              email: response.email || this.registerForm.value.email
            }
          });
        }, 5000);
      },
      error: (error) => {
        console.error('❌ Erreur d\'inscription', error);

        // Afficher le message d'erreur
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.errors) {
          // Erreurs de validation
          this.errorMessage = Object.values(error.error.errors).join(', ');
        } else {
          this.errorMessage = 'Une erreur est survenue lors de l\'inscription';
        }

        // Désactiver le loader
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Toggle affichage du mot de passe
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Marquer tous les champs comme touchés
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Vérifier si un champ a une erreur
   */
  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * Récupérer le message d'erreur d'un champ
   */
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum ${minLength} caractères`;
    }

    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} caractères`;
    }

    if (field.hasError('email')) {
      return 'Format d\'email invalide';
    }

    if (field.hasError('pattern')) {
      if (fieldName === 'pseudo') {
        return 'Lettres, chiffres, tirets et underscores uniquement';
      }
      if (fieldName === 'email') {
        return 'Format d\'email invalide';
      }
      if (fieldName === 'motDePasse') {
        return '1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial';
      }
    }

    if (field.hasError('min')) {
      return 'Numéro de téléphone invalide (minimum 8 chiffres)';
    }

    if (field.hasError('max')) {
      return 'Numéro de téléphone invalide (maximum 15 chiffres)';
    }

    return '';
  }
}
