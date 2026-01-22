// src/app/features/calendrier/calendrier.component.ts

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import frLocale from '@fullcalendar/core/locales/fr';

import { CalendrierService } from '../../../services/calendrier.service';
import { UtilisateurService } from '../../../services/utilisateur.service';
import { ProduitService } from '../../../services/produit.service';
import {
  CalendrierEvent,
  CalendrierFiltre,
  CalendrierStatistiques
} from '../../../core/models/calendrier.model';
import { UserResponse, ProduitResponse } from '../../../core/models';

/**
 * Composant de gestion du calendrier
 * Affiche les réservations et livraisons
 */
@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendrier.component.html',
  styleUrls: ['./calendrier.component.scss']
})
export class CalendrierComponent implements OnInit {
  private calendrierService = inject(CalendrierService);
  private utilisateurService = inject(UtilisateurService);
  private produitService = inject(ProduitService);

  // ============================================
  // ÉTAT DU COMPOSANT
  // ============================================
  evenements = signal<CalendrierEvent[]>([]);
  statistiques = signal<CalendrierStatistiques | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Listes pour les filtres
  clients = signal<UserResponse[]>([]);
  employes = signal<UserResponse[]>([]);
  produits = signal<ProduitResponse[]>([]);

  // Panneau de filtres
  afficherFiltres = signal(true);

  // Événement sélectionné pour la modal
  evenementSelectionne = signal<CalendrierEvent | null>(null);
  afficherModal = signal(false);


  // FILTRES

  filtres: CalendrierFiltre = {
    inclureReservations: true,
    inclureLivraisons: true,
    statutsReservation: [],
    statutsLivraison: []
  };

  // Options des statuts
  statutsReservationOptions = [
    { value: 'EN_ATTENTE', label: 'En Attente (Devis)' },
    { value: 'CONFIRME', label: 'Confirmé' },
    { value: 'ANNULE', label: 'Annulé' },
    { value: 'TERMINE', label: 'Terminé' }
  ];

  statutsLivraisonOptions = [
    { value: 'NOT_TODAY', label: 'Planifiée' },
    { value: 'EN_ATTENTE', label: 'En Attente' },
    { value: 'EN_COURS', label: 'En Cours' },
    { value: 'LIVREE', label: 'Livrée' },
    { value: 'EN_RETOUR', label: 'En Retour' },
    { value: 'RETOURNEE', label: 'Retournée' }
  ];


  // CONFIGURATION FULLCALENDAR

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth', // On peut changer Par : 'timeGridWeek', 'timeGridDay', 'listWeek'
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Liste'
    },
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    height: 'auto',
    eventClick: this.handleEventClick.bind(this),
    datesSet: this.handleDatesSet.bind(this),
    events: []
  };


  ngOnInit(): void {
    this.chargerDonneesInitiales();
    this.chargerEvenements();
  }


  // CHARGEMENT DES DONNÉES

  private chargerDonneesInitiales(): void {
    // Charger les clients
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => {
        this.clients.set(users.filter(u => u.roles.includes('CLIENT')));
      },
      error: (err) => console.error('Erreur chargement clients:', err)
    });

    // Charger les employés
    this.utilisateurService.getAllUtilisateurs().subscribe({
      next: (users) => {
        this.employes.set(users.filter(u =>
          u.roles.includes('EMPLOYE') || u.roles.includes('ADMIN') || u.roles.includes('MANAGER')
        ));
      },
      error: (err) => console.error('Erreur chargement employés:', err)
    });

    // Charger les produits
    this.produitService.getAllProduits().subscribe({
      next: (produits) => {
        this.produits.set(produits);
      },
      error: (err) => console.error('Erreur chargement produits:', err)
    });
  }

  chargerEvenements(): void {
    this.loading.set(true);
    this.error.set(null);

    this.calendrierService.getEvenements(this.filtres).subscribe({
      next: (events) => {
        this.evenements.set(events);

        // Convertir pour FullCalendar
        const fullCalendarEvents = events.map(e =>
          this.calendrierService.convertToFullCalendarEvent(e)
        );

        this.calendarOptions = {
          ...this.calendarOptions,
          events: fullCalendarEvents
        };

        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erreur lors du chargement des événements');
        console.error('Erreur:', err);
        this.loading.set(false);
      }
    });
  }


  // GESTION DES ÉVÉNEMENTS FULLCALENDAR

  handleEventClick(clickInfo: EventClickArg): void {
    const eventData = clickInfo.event.extendedProps['eventData'] as CalendrierEvent;
    this.evenementSelectionne.set(eventData);
    this.afficherModal.set(true);
  }

  handleDatesSet(dateInfo: any): void {
    // Charger les statistiques pour la période visible
    const debut = this.calendrierService.formatDate(dateInfo.start);
    const fin = this.calendrierService.formatDate(dateInfo.end);

    this.calendrierService.getStatistiques(debut, fin).subscribe({
      next: (stats) => {
        this.statistiques.set(stats);
      },
      error: (err) => console.error('Erreur statistiques:', err)
    });
  }


  // GESTION DES FILTRES

  appliquerFiltres(): void {
    this.chargerEvenements();
  }

  reinitialiserFiltres(): void {
    this.filtres = {
      inclureReservations: true,
      inclureLivraisons: true,
      statutsReservation: [],
      statutsLivraison: []
    };
    this.chargerEvenements();
  }

  toggleFiltre(type: 'reservations' | 'livraisons'): void {
    if (type === 'reservations') {
      this.filtres.inclureReservations = !this.filtres.inclureReservations;
    } else {
      this.filtres.inclureLivraisons = !this.filtres.inclureLivraisons;
    }
    this.chargerEvenements();
  }

  onStatutReservationChange(statut: string, checked: boolean): void {
    if (!this.filtres.statutsReservation) {
      this.filtres.statutsReservation = [];
    }

    if (checked) {
      this.filtres.statutsReservation.push(statut);
    } else {
      this.filtres.statutsReservation = this.filtres.statutsReservation.filter(s => s !== statut);
    }
  }

  onStatutLivraisonChange(statut: string, checked: boolean): void {
    if (!this.filtres.statutsLivraison) {
      this.filtres.statutsLivraison = [];
    }

    if (checked) {
      this.filtres.statutsLivraison.push(statut);
    } else {
      this.filtres.statutsLivraison = this.filtres.statutsLivraison.filter(s => s !== statut);
    }
  }


  // MODAL

  fermerModal(): void {
    this.afficherModal.set(false);
    this.evenementSelectionne.set(null);
  }

  ouvrirDetails(): void {
    const event = this.evenementSelectionne();
    if (!event) return;

    // Rediriger vers la page de détails selon le type
    if (event.type === 'RESERVATION') {
      window.open(`admin/reservation-details/${event.id}`, '_blank');
    } else {
      window.open(`admin/livraisons/${event.id}`, '_blank');
    }
  }
}
