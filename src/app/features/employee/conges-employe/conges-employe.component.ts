import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CongeService } from '../../../services/conge.service';
import { NotificationService } from '../../../services/notification.service';
import { StorageService } from '../../../core/services/storage.service';
import { DemandeCongeResponse, StatutDemandeConge, StatutDemandeCongeLabels } from '../../../core/models/conge.model';

@Component({
  selector: 'app-conges-employe',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './conges-employe.component.html',
  styleUrl: './conges-employe.component.scss'
})
export class CongesEmployeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private congeService = inject(CongeService);
  private notificationService = inject(NotificationService);
  private storageService = inject(StorageService);

  congeForm!: FormGroup;
  mesDemandes = signal<DemandeCongeResponse[]>([]);
  soldeConges = signal<number>(30);
  isLoading = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);

  readonly statutLabels = StatutDemandeCongeLabels;
  readonly StatutDemandeConge = StatutDemandeConge;

  // Calcul dynamique des jours ouvrables sélectionnés dans le formulaire
  joursEstimes = signal<number>(0);

  ngOnInit(): void {
    this.initForm();
    this.chargerDonnees();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.congeForm = this.fb.group({
      dateDebut: [today, Validators.required],
      dateFin: [today, Validators.required],
      motif: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.congeForm.valueChanges.subscribe(val => {
      this.calculerJoursOuvrables(val.dateDebut, val.dateFin);
    });
    this.calculerJoursOuvrables(today, today);
  }

  chargerDonnees(): void {
    this.isLoading.set(true);
    const user = this.storageService.getUser();
    if (user && (user as any).soldeConges !== undefined) {
      this.soldeConges.set((user as any).soldeConges);
    }

    this.congeService.getMesDemandes().subscribe({
      next: (demandes) => {
        this.mesDemandes.set(demandes);
        if (demandes.length > 0) {
          this.soldeConges.set(demandes[0].soldeCongesRestant);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement de vos demandes');
        this.isLoading.set(false);
      }
    });
  }

  calculerJoursOuvrables(debutStr: string, finStr: string): void {
    if (!debutStr || !finStr) {
      this.joursEstimes.set(0);
      return;
    }
    const debut = new Date(debutStr);
    const fin = new Date(finStr);
    if (fin < debut) {
      this.joursEstimes.set(0);
      return;
    }
    let count = 0;
    const cur = new Date(debut);
    while (cur <= fin) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++; // Exclure Dimanche (0) et Samedi (6)
      cur.setDate(cur.getDate() + 1);
    }
    this.joursEstimes.set(count);
  }

  soumettreDemande(): void {
    if (this.congeForm.invalid || this.joursEstimes() <= 0) {
      this.notificationService.warning('Veuillez vérifier les dates et le motif.');
      return;
    }

    this.isSubmitting.set(true);
    this.congeService.demanderConge(this.congeForm.value).subscribe({
      next: () => {
        this.notificationService.success('Demande de congé envoyée avec succès !');
        this.congeForm.patchValue({ motif: '' });
        this.isSubmitting.set(false);
        this.chargerDonnees();
      },
      error: (err) => {
        this.notificationService.error(err.error?.message || 'Erreur lors de la demande');
        this.isSubmitting.set(false);
      }
    });
  }

  getBadgeClass(statut: StatutDemandeConge): string {
    switch (statut) {
      case StatutDemandeConge.ACCEPTEE: return 'badge-success';
      case StatutDemandeConge.REFUSEE: return 'badge-danger';
      default: return 'badge-warning';
    }
  }
}
