// src/app/features/auth/pages/login/login.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService  } from '../../../../core/services/auth.service';
import { StorageService  } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storage = inject(StorageService)

  loginForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;

  showResendButton = false;
  userEmail = '';
  isResending = false;

  constructor() {
    this.loginForm = this.fb.group({
      identifiant: ['', [Validators.required, Validators.minLength(3)]],
      motDePasse: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {

    // ✅ Si déjà connecté, rediriger vers dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      // CAS 1 : Vient de s'inscrire
      if (params['registered'] === 'true') {
        this.successMessage = '✅ Inscription réussie ! Un email d\'activation vous a été envoyé. Vérifiez votre boîte email.';

        if (params['email']) {
          this.loginForm.patchValue({
            identifiant: params['email']
          });
        }
      }

      // CAS 2 : Vient de l'activation du compte
      else if (params['activated'] === 'true') {
        this.successMessage = '✅ Compte activé avec succès ! Vous pouvez maintenant vous connecter.';

        if (params['email']) {
          this.loginForm.patchValue({
            identifiant: params['email']
          });
        }
      }

      // CAS 3 : Erreur d'activation
      else if (params['activated'] === 'false') {
        this.errorMessage = params['error'] || 'Erreur lors de l\'activation du compte';
      }

      //  CAS 4 : Token expiré
      else if (params['expired'] === 'true') {
        this.storage.clear();
        this.errorMessage = ' Votre session a expiré. Veuillez vous reconnecter.';
        setTimeout(()=>this.errorMessage='',2000)
        console.log('🧹 Token expiré nettoyé , reconnect de nouveau ');
      }

      //  CAS 5 : Déconnecté (optionnel)
      else if (params['logout'] === 'true') {
        this.successMessage = '✅ Vous avez été déconnecté avec succès.';
        setTimeout(()=>this.successMessage='',3000)
        console.log('🧹 Token expiré nettoyé , déconnexion réussi ');
      }
      //Cas 6 si il y a une erreur d'access
      else if (params['access'] === 'false') {
        if (params['message']) {
          this.errorMessage = decodeURIComponent(params['message']);
        } else {
          this.errorMessage = 'Cet identifiant est déjà inscrit avec un mot de passe. Veuillez utiliser la connexion classique.';
        }
        // Pré-remplir l'email si disponible dans l'URL ou le message
        if (params['email']) {
          this.loginForm.patchValue({
            identifiant: params['email']
          });
        }
      }
      else if (params['error']){
        this.errorMessage = decodeURIComponent(params['error']);
      }
    }
    );
  }


  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showResendButton = false;

    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (user) => {
        console.log('✅ Connexion réussie', user);

        if (user.requirePasswordChange) {
          // Rediriger vers page de changement de mot de passe
          this.router.navigate(['/auth/first-login']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: (error) => {
        console.error('❌ Erreur de connexion', error);

        // CAS 1: Compte non activé
        if (error.error?.error === 'ACCOUNT_NOT_ACTIVATED') {
          this.errorMessage = error.error.message;
          this.showResendButton = true;
          this.userEmail = error.error.email;
        }
        // CAS 2: Autres erreurs
        else {
          this.errorMessage = error.error?.message || 'Identifiant ou mot de passe incorrect';
          this.showResendButton = false;
        }

        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /**
   * Renvoyer l'email d'activation
   */
  resendActivationEmail(): void {
    this.isResending = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendActivationEmail(this.userEmail).subscribe({
      next: (response: any) => {
        console.log('✅ Email renvoyé', response);
        this.successMessage = '✅ Email d\'activation renvoyé ! Vérifiez votre boîte email.';
        this.showResendButton = false;
        this.isResending = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du renvoi', error);
        this.errorMessage = error.error?.error || 'Erreur lors du renvoi de l\'email';
        this.isResending = false;
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} caractères`;
    }

    return '';
  }
}
