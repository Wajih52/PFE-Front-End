import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AvisService } from '../../../services/avis.service';
import { AvisResponseDto, AvisUpdateDto } from '../../../core/models/avis.model';

@Component({
  selector: 'app-avis-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './avis-edit.component.html',
  styleUrl: './avis-edit.component.scss'
})
export class AvisEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private avisService = inject(AvisService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  avisForm!: FormGroup;
  avisActuel = signal<AvisResponseDto | null>(null);
  selectedNote = signal(0);
  hoverNote = signal(0);
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  idAvis!: number;

  ngOnInit(): void {
    this.idAvis = +this.route.snapshot.paramMap.get('idAvis')!;
    this.initForm();
    this.chargerAvis();
  }

  initForm(): void {
    this.avisForm = this.fb.group({
      note: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      commentaire: ['', [Validators.maxLength(1000)]]
    });
  }

  chargerAvis(): void {
    this.loading.set(true);
    this.avisService.getMesAvis().subscribe({
      next: (avisList) => {
        const avis = avisList.find(a => a.idAvis === this.idAvis);
        if (!avis) {
          this.errorMessage.set('Avis introuvable');
          this.loading.set(false);
          return;
        }

        if (!avis.peutEtreModifie) {
          this.errorMessage.set('Vous ne pouvez plus modifier cet avis');
          this.loading.set(false);
          setTimeout(() => this.router.navigate(['/client/mes-avis']), 2000);
        }

        this.avisActuel.set(avis);
        this.selectedNote.set(avis.note);
        this.avisForm.patchValue({
          note: avis.note,
          commentaire: avis.commentaire || ''
        });
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Erreur lors du chargement');
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

    const dto: AvisUpdateDto = {
      idAvis: this.idAvis,
      note: this.avisForm.value.note,
      commentaire: this.avisForm.value.commentaire
    };

    this.avisService.modifierAvis(dto).subscribe({
      next: () => {
        this.successMessage.set('✅ Votre avis a été modifié avec succès !');
        setTimeout(() => this.router.navigate(['/client/mes-avis']), 2000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Erreur lors de la modification');
        this.submitting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/mes-avis']);
  }
}
