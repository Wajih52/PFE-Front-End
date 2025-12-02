// src/app/features/admin/pages/dashboard-statistiques/dashboard-statistiques.component.ts

import { Component, OnInit, inject, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StatistiquesService } from '../../../../services/statistiques.service';
import { DashboardStatistiques, TopProduit, TopEmploye } from '../../../../core/models/statistiques.model';

// Enregistrer tous les composants Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-statistiques',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-statistiques.component.html',
  styleUrl: './dashboard-statistiques.component.scss'
})
export class DashboardStatistiquesComponent implements OnInit {
  private readonly statistiquesService = inject(StatistiquesService);

  // ============ STATE ============
  stats = signal<DashboardStatistiques | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Filtres de période
  periodFilter = signal<'moisActuel' | 'personnalise'>('moisActuel');
  dateDebut = signal<string>('');
  dateFin = signal<string>('');

  // Charts instances
  private charts: { [key: string]: Chart } = {};

  // ============ CANVAS REFS ============
  @ViewChild('evolutionCAChart') evolutionCACanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('repartitionStatutsChart') repartitionStatutsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('topProduitsChart') topProduitsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('caParCategorieChart') caParCategorieCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('evolutionReservationsChart') evolutionReservationsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('notesParCategorieChart') notesParCategorieCanvas!: ElementRef<HTMLCanvasElement>;

  ngOnInit(): void {
    this.loadStatistiques();
  }

  /**
   * Charger les statistiques
   */
  loadStatistiques(): void {
    this.loading.set(true);
    this.error.set(null);

    const request = this.periodFilter() === 'personnalise'
      ? this.statistiquesService.getDashboardStatistiquesPeriode(
        this.dateDebut(),
        this.dateFin()
      )
      : this.statistiquesService.getDashboardStatistiques();

    request.subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);

        // Créer les graphiques après un court délai pour s'assurer que les canvas sont disponibles
        setTimeout(() => this.createAllCharts(), 100);
      },
      error: (err) => {
        console.error('❌ Erreur chargement statistiques:', err);
        this.error.set('Impossible de charger les statistiques');
        this.loading.set(false);
      }
    });
  }

  /**
   * Appliquer le filtre de période
   */
  applyPeriodFilter(): void {
    if (this.periodFilter() === 'personnalise' && (!this.dateDebut() || !this.dateFin())) {
      alert('Veuillez sélectionner une période complète');
      return;
    }

    this.destroyAllCharts();
    this.loadStatistiques();
  }

  /**
   * Réinitialiser les filtres
   */
  resetFilters(): void {
    this.periodFilter.set('moisActuel');
    this.dateDebut.set('');
    this.dateFin.set('');
    this.destroyAllCharts();
    this.loadStatistiques();
  }

  // ============================================
  // CRÉATION DES GRAPHIQUES
  // ============================================

  /**
   * Créer tous les graphiques
   */
  private createAllCharts(): void {
    const stats = this.stats();
    if (!stats) return;

    this.createEvolutionCAChart(stats);
    this.createRepartitionStatutsChart(stats);
    this.createTopProduitsChart(stats);
    this.createCAParCategorieChart(stats);
    this.createEvolutionReservationsChart(stats);
    this.createNotesParCategorieChart(stats);
  }

  /**
   * Détruire tous les graphiques existants
   */
  private destroyAllCharts(): void {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }

  /**
   * Graphique: Évolution du CA sur 12 mois
   */
  private createEvolutionCAChart(stats: DashboardStatistiques): void {
    if (!this.evolutionCACanvas) return;

    const ctx = this.evolutionCACanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = stats.evolutionCA12Mois.map(m => m.mois);
    const data = stats.evolutionCA12Mois.map(m => m.chiffreAffaires);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Chiffre d\'affaires (TND)',
          data: data,
          borderColor: '#C8A882',
          backgroundColor: 'rgba(200, 168, 130, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#C8A882',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: { size: 14, weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#C8A882',
            bodyColor: '#fff',
            borderColor: '#C8A882',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: (context) => {
                const value = context.parsed?.y;
                if (value === null || value === undefined) {
                  return `CA: 0 TND`;
                }
                return `CA: ${value.toLocaleString('fr-FR')} TND`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return value.toLocaleString('fr-FR') + ' TND';
              },
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#666',
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts['evolutionCA'] = new Chart(ctx, config);
  }

  /**
   * Graphique: Répartition des réservations par statut
   */
  private createRepartitionStatutsChart(stats: DashboardStatistiques): void {
    if (!this.repartitionStatutsCanvas) return;

    const ctx = this.repartitionStatutsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(stats.repartitionReservationsParStatut);
    const data = Object.values(stats.repartitionReservationsParStatut);

    const colors = [
      '#f38606', // Devis
      '#166703', // Reservation confirmé
      '#67625a', // Reservation Terminé
      '#dc1010', // reservation annulée
      '#67625a'  //
    ];

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 3,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#333',
              font: { size: 13 },
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#C8A882',
            bodyColor: '#fff',
            borderColor: '#C8A882',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.charts['repartitionStatuts'] = new Chart(ctx, config);
  }

  /**
   * Graphique: Top 10 produits les plus loués
   */
  private createTopProduitsChart(stats: DashboardStatistiques): void {
    if (!this.topProduitsCanvas) return;

    const ctx = this.topProduitsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = stats.topProduitsLoues.map(p => p.nomProduit);
    const data = stats.topProduitsLoues.map(p => p.nombreLocations);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de locations',
          data: data,
          backgroundColor: '#C8A882',
          borderColor: '#000',
          borderWidth: 1,
          hoverBackgroundColor: '#000',
          hoverBorderColor: '#C8A882',
          hoverBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#C8A882',
            bodyColor: '#fff',
            borderColor: '#C8A882',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: '#666',
              stepSize: 1
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              color: '#666',
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts['topProduits'] = new Chart(ctx, config);
  }

  /**
   * Graphique: CA par catégorie
   */
  private createCAParCategorieChart(stats: DashboardStatistiques): void {
    if (!this.caParCategorieCanvas) return;

    const ctx = this.caParCategorieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(stats.caParCategorie);
    const data = Object.values(stats.caParCategorie);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'CA (TND)',
          data: data,
          backgroundColor: '#686867',
          borderColor: '#000',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#C8A882',
            bodyColor: '#fff',
            borderColor: '#C8A882',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const value = context.parsed?.y;
                if (value === null || value === undefined) {
                  return `CA: 0 TND`;
                }
                return `CA: ${value.toLocaleString('fr-FR')} TND`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return value.toLocaleString('fr-FR') + ' TND';
              },
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#666'
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts['caParCategorie'] = new Chart(ctx, config);
  }

  /**
   * Graphique: Évolution du nombre de réservations
   */
  private createEvolutionReservationsChart(stats: DashboardStatistiques): void {
    if (!this.evolutionReservationsCanvas) return;

    const ctx = this.evolutionReservationsCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = stats.evolutionReservations12Mois.map(m => m.mois);
    const data = stats.evolutionReservations12Mois.map(m => m.nombreReservations);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de réservations',
          data: data,
          borderColor: '#000',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#000',
          pointBorderColor: '#C8A882',
          pointBorderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: { size: 14, weight: 'bold' }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              color: '#666',
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.charts['evolutionReservations'] = new Chart(ctx, config);
  }

  /**
   * Graphique: Moyennes des notes par catégorie
   */
  private createNotesParCategorieChart(stats: DashboardStatistiques): void {
    if (!this.notesParCategorieCanvas) return;

    const ctx = this.notesParCategorieCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = Object.keys(stats.moyenneNotesParCategorie);
    const data = Object.values(stats.moyenneNotesParCategorie);

    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Note moyenne /5',
          data: data,
          backgroundColor: 'rgba(200, 168, 130, 0.2)',
          borderColor: '#C8A882',
          pointBackgroundColor: '#C8A882',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#333',
              font: { size: 14, weight: 'bold' }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: {
              stepSize: 1,
              color: '#666'
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            pointLabels: {
              color: '#333',
              font: { size: 12 }
            }
          }
        }
      }
    };

    this.charts['notesParCategorie'] = new Chart(ctx, config);
  }

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Formater un nombre avec séparateurs
   */
  formatNumber(value: number | undefined): string {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
  }

  /**
   * Formater un montant en TND
   */
  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '0 TND';
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;
  }

  /**
   * Formater un pourcentage
   */
  formatPercentage(value: number | undefined): string {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(1)}%`;
  }

  /**
   * Obtenir la classe CSS pour l'évolution
   */
  getEvolutionClass(value: number | undefined): string {
    if (value === undefined || value === null) return '';
    return value >= 0 ? 'positive' : 'negative';
  }

  /**
   * Télécharger un rapport PDF
   */
  telechargerPDF(): void {
    this.loading.set(true);

    this.statistiquesService.telechargerRapportPDF().subscribe({
      next: (blob) => {
        const date = new Date().toISOString().split('T')[0];
        this.downloadFile(blob, `rapport_statistiques_${date}.pdf`);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur téléchargement PDF:', err);
        this.loading.set(false);
      }
    });
  }

  /**
   * Télécharger un rapport Excel
   */
  telechargerExcel(): void {
    this.loading.set(true);

    this.statistiquesService.telechargerRapportExcel().subscribe({
      next: (blob) => {
        const date = new Date().toISOString().split('T')[0];
        this.downloadFile(blob, `rapport_statistiques_${date}.xlsx`);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur téléchargement Excel:', err);
        alert('Erreur lors du téléchargement du rapport Excel');
        this.loading.set(false);
      }
    });
  }

  /**
   * Utilitaire pour télécharger un fichier Blob
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Nettoyer les ressources lors de la destruction du composant
   */
  ngOnDestroy(): void {
    this.destroyAllCharts();
  }
}
