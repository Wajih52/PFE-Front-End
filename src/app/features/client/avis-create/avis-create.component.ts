import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisService } from '../../../services/avis.service';
import { AvisCreateDto } from '../../../core/models/avis.model';

@Component({
  selector: 'app-avis-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis-create.component.html',
  styleUrl: './avis-create.component.scss'
})
export class AvisCreateComponent implements OnInit {

  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  avisForm!: FormGroup;
  selectedNote = signal(0);
  hoverNote = signal(0);
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  idReservation!: number;
  idProduit!: number;

  ngOnInit(): void {
    this.idReservation = +this.route.snapshot.paramMap.get('idReservation')!;
    this.idProduit = +this.route.snapshot.paramMap.get('idProduit')!;

    this.initForm();
    this.verifierSiPeutEvaluer();
  }

  initForm(): void {
    this.avisForm = this.fb.group({
      note: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      commentaire: ['', [Validators.maxLength(1000)]]
    });
  }

  verifierSiPeutEvaluer(): void {
    this.loading.set(true);
    this.avisService.peutEvaluerProduit(this.idReservation, this.idProduit).subscribe({
      next: (peut) => {
        if (!peut) {
          this.errorMessage.set('Vous ne pouvez pas évaluer ce produit.');
          setTimeout(() => this.router.navigate(['/client/reservation-details/',this.idReservation]), 2000);
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors de la vérification.');
        this.loading.set(false);
      }
    });
  }

  setNote(note: number): void {
    this.selectedNote.set(note);
    this.avisForm.patchValue({ note });
  }

  onSubmit(): void {
    if (this.avisForm.invalid) return;

    this.submitting.set(true);
    this.errorMessage.set('');

    const dto: AvisCreateDto = {
      idReservation: this.idReservation,
      idProduit: this.idProduit,
      note: this.avisForm.value.note,
      commentaire: this.avisForm.value.commentaire
    };

    this.avisService.creerAvis(dto).subscribe({
      next: () => {
        this.successMessage.set('✅ Votre avis a été publié avec succès !');
        setTimeout(() => this.router.navigate(['/client/mes-avis']), 2000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de la création de l\'avis');
        this.submitting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/reservation-details/',this.idReservation]);
  }
}
