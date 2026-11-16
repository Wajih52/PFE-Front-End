// src/app/features/auth/pages/first-login/first-login.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import { variables } from '../../../../core/environement/variables';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [CommonModule,RouterModule],
  templateUrl: './first-login.component.html',
  styleUrl: './first-login.component.scss'
})
export class FirstLoginComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  isLoading = true;
  hasError = false;
  errorMessage = '';

  ngOnInit(): void {

    // Récupérer le token d'activation dans l'URL
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.afficherErreur("Aucun lien d'activation n'a été fourni.");
      return;
    }

    // Vérification du token auprès de Spring Boot
    this.http.get(`${variables.apiUrl}/utilisateurs/verifier-token?token=${token}`).subscribe({
      next: () => {
        // Token valide : on maintient l'animation 3 secondes puis on redirige
        setTimeout(() => {
          this.router.navigate(['/auth/creer-motDePasse'], {
            queryParams: { token }
          }).catch(error => {
            console.error('Navigation error:', error);
            this.router.navigate(['/auth/login'], { replaceUrl: true });
          });
        }, 3000);
      },
      error: (err) => {
        // Token expiré ou invalide
        this.afficherErreur(err.error?.message || 'Ce lien d\'activation est invalide ou a expiré.');
      }
    });

  }

  private afficherErreur(message: string): void {
    this.isLoading = false;
    this.hasError = true;
    this.errorMessage = message;
  }
}
