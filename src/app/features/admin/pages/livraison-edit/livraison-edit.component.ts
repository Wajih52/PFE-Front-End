// src/app/features/admin/pages/livraison-edit/livraison-edit.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LivraisonService } from '../../../../services/livraison.service';
import { LivraisonRequestDto, LivraisonResponseDto } from '../../../../core/models/livraison.model';

@Component({
  selector: 'app-livraison-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './livraison-edit.component.html',
  styleUrls: ['./livraison-edit.component.scss']
})
export class LivraisonEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private livraisonService = inject(LivraisonService);

  // État
  livraison = signal<LivraisonResponseDto | null>(null);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Formulaire
  editForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    const idLivraison = Number(this.route.snapshot.paramMap.get('id'));
    this.chargerLivraison(idLivraison);
  }

  initForm(): void {
    this.editForm = this.fb.group({
      titreLivraison: ['', [Validators.required, Validators.minLength(3)]],
      adresseLivraison: ['', [Validators.required, Validators.minLength(5)]],
      dateLivraison: ['', Validators.required],
      heureLivraison: ['', Validators.required],
      observations: ['']
    });
  }

  chargerLivraison(idLivraison: number): void {
    this.isLoading.set(true);
    this.livraisonService.getLivraisonById(idLivraison).subscribe({
      next: (data) => {
        this.livraison.set(data);
        this.remplirFormulaire(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set('Impossible de charger la livraison');
        this.isLoading.set(false);
      }
    });
  }

  remplirFormulaire(livraison: LivraisonResponseDto): void {
    this.editForm.patchValue({
      titreLivraison: livraison.titreLivraison,
      adresseLivraison: livraison.adresseLivraison,
      dateLivraison: livraison.dateLivraison,
      heureLivraison: livraison.heureLivraison,
      observations: livraison.observations
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    const livraison = this.livraison();
    if (!livraison) return;

    this.isSaving.set(true);
    this.errorMessage.set('');

    const request: LivraisonRequestDto = {
      titreLivraison: this.editForm.value.titreLivraison,
      adresseLivraison: this.editForm.value.adresseLivraison,
      dateLivraison: this.editForm.value.dateLivraison,
      heureLivraison:this.livraisonService.formatTimeForApi(this.editForm.value.heureLivraison),
      observations: this.editForm.value.observations || undefined,
      idLignesReservation: [] // On ne modifie pas les lignes dans l'édition simple
    };

    this.livraisonService.modifierLivraison(livraison.idLivraison, request).subscribe({
      next: (updated) => {
        this.successMessage.set('Livraison modifiée avec succès !');
        this.isSaving.set(false);

        // Rediriger après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/admin/livraisons', updated.idLivraison]);
        }, 2000);
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.errorMessage.set(error.error?.message || 'Erreur lors de la modification');
        this.isSaving.set(false);
      }
    });
  }

  annuler(): void {
    if (this.livraison()) {
      this.router.navigate(['/admin/livraisons', this.livraison()!.idLivraison]);
    } else {
      this.router.navigate(['/admin/livraisons']);
    }
  }
}
