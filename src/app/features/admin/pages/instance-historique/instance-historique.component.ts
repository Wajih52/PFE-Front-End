// src/app/features/admin/pages/instance-historique/instance-historique.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { InstanceProduitService } from '../../../../services/instance-produit.service';
import {
  MouvementStockResponse,
  TypeMouvementLabels
} from '../../../../core/models';
import { MenuNavigationComponent } from '../menu-navigation/menu-navigation.component';

@Component({
  selector: 'app-instance-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './instance-historique.component.html',
  styleUrls: ['./instance-historique.component.scss']
})
export class InstanceHistoriqueComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instanceService = inject(InstanceProduitService);

  numeroSerie: string = '';
  mouvements: MouvementStockResponse[] = [];
  isLoading = true;
  errorMessage = '';

  readonly TypeMouvementLabels = TypeMouvementLabels;

  ngOnInit(): void {
    this.numeroSerie = this.route.snapshot.params['numeroSerie'];
    this.loadHistorique();
  }

  loadHistorique(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.instanceService.getHistoriqueMouvementsInstance(this.numeroSerie).subscribe({
      next: (data) => {
        this.mouvements = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement historique:', error);
        this.errorMessage = 'Erreur lors du chargement de l\'historique';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/instances']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR');
  }
}
