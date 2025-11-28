import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AvisService } from '../../../services/avis.service';
import { AvisResponseDto, StatutAvis } from '../../../core/models/avis.model';

@Component({
  selector: 'app-mes-avis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mes-avis.component.html',
  styleUrl: './mes-avis.component.scss'
})
export class MesAvisComponent implements OnInit {
  private avisService = inject(AvisService);
  private router = inject(Router);

  avisList = signal<AvisResponseDto[]>([]);
  loading = signal(false);
  errorMessage = signal('');
  StatutAvis = StatutAvis;

  ngOnInit(): void {
    this.loadMesAvis();
  }

  loadMesAvis(): void {
    this.loading.set(true);
    this.avisService.getMesAvis().subscribe({
      next: (avis) => {
        this.avisList.set(avis);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Erreur lors du chargement');
        this.loading.set(false);
      }
    });
  }

  getStatutLabel(statut: StatutAvis): string {
    switch (statut) {
      case StatutAvis.EN_ATTENTE: return 'En attente';
      case StatutAvis.APPROUVE: return 'Approuvé';
      case StatutAvis.REJETE: return 'Rejeté';
      case StatutAvis.SIGNALE: return 'Signalé';
      default: return statut;
    }
  }

  getStatutClass(statut: StatutAvis): string {
    switch (statut) {
      case StatutAvis.EN_ATTENTE: return 'en-attente';
      case StatutAvis.APPROUVE: return 'approuve';
      case StatutAvis.REJETE: return 'rejete';
      default: return '';
    }
  }

  modifierAvis(avis: AvisResponseDto): void {
    this.router.navigate(['/client/avis/modifier', avis.idAvis]);
  }

  supprimerAvis(avis: AvisResponseDto): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    this.avisService.supprimerAvis(avis.idAvis).subscribe({
      next: () => {
        this.avisList.update(list => list.filter(a => a.idAvis !== avis.idAvis));
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
      }
    });
  }

}
