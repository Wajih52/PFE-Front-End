import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { driver, DriveStep } from 'driver.js';

@Injectable({
  providedIn: 'root'
})
export class OnboardingTourService {
  private platformId = inject(PLATFORM_ID);
  private readonly TOUR_CATALOGUE_KEY = 'elegant_hive_tour_catalogue_vu';
  private readonly TOUR_PANIER_KEY = 'elegant_hive_tour_panier_vu';
  private readonly TOUR_DEVIS_KEY = 'elegant_hive_tour_devis_vu';
  private readonly TOUR_COMMANDES_KEY = 'elegant_hive_tour_commandes_vu';
  private readonly TOUR_RESERVATION_DETAILS_KEY = 'elegant_hive_tour_reservation_details_vu';
  private readonly TOUR_PAIEMENT_KEY = 'elegant_hive_tour_paiement_vu';

  /**
   * Lance le guide interactif de la page Catalogue.
   * @param forcer Si true, relance le guide même si le client l'a déjà vu (bouton Aide).
   */
  lancerGuideCatalogue(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && localStorage.getItem(this.TOUR_CATALOGUE_KEY) === 'true') {
      return;
    }

    const steps: DriveStep[] = [
      {
        element: '#tour-dates',
        popover: {
          title: '1. Choisissez vos dates d’événement',
          description:
            'Indiquez la date de début et de fin de location. Le catalogue se met automatiquement à jour avec le stock réellement disponible sur cette période.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-ai-banner',
        popover: {
          title: '2. Recommandation intelligente',
          description:
            'Vous hésitez sur le matériel à choisir ? Utilisez notre assistant de recommandation IA pour obtenir des suggestions adaptées à votre événement.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-filtres',
        popover: {
          title: '3. Affinez votre recherche',
          description:
            'Filtrez les articles par nom, catégorie (Mobilier, Lumière, Décoration...) ou tranche de prix en TND.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.btn-view',
        popover: {
          title: '4. Consultez la fiche et les avis',
          description:
            'Cliquez sur l’œil pour voir la description complète, la quantité disponible et les avis des autres clients.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.btn-add-cart',
        popover: {
          title: '5. Ajoutez au panier',
          description:
            'Ajoutez directement le matériel souhaité à votre panier. Le bouton se désactive automatiquement si le produit est indisponible à vos dates.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '#tour-panier',
        popover: {
          title: '6. Finalisez votre devis ou commande',
          description:
            'Retrouvez ici tous vos articles sélectionnés pour demander un devis gratuit ou passer directement commande.',
          side: 'left',
          align: 'center'
        }
      }
    ];

    // Ne garder que les étapes dont l'élément existe actuellement dans le DOM
    // (utile par exemple si aucun produit n'est affiché pour la période choisie)
    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        localStorage.setItem(this.TOUR_CATALOGUE_KEY, 'true');
      }
    });

    driverObj.drive();
  }

  /**
   * Lance le guide interactif de la page Panier et de la demande de devis.
   */
  lancerGuidePanier(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && this.aDejaVuGuidePanier()) {
      return;
    }

    const panierRempli = !!document.querySelector('#tour-panier-liste');

    const steps: DriveStep[] = panierRempli
      ? [
        {
          element: '#tour-panier-liste',
          popover: {
            title: '1. Vérifiez vos articles et disponibilités',
            description:
              'Ajustez vos quantités, ou ajoutez des remarques par produit. La disponibilité est vérifiée automatiquement : un article indisponible est signalé en rouge.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '#observations',
          popover: {
            title: '2. Ajoutez vos remarques générales',
            description:
              'Précisez ici toute information utile pour votre événement (lieu, horaires souhaités, contraintes d’accès...).',
            side: 'left',
            align: 'center'
          }
        },
        {
          element: '.btn-valider',
          popover: {
            title: '3. Demander un devis (Recommandé)',
            description:
              'Envoyez votre panier à notre équipe : un manager ou administrateur traitera votre demande et pourra appliquer une remise. Vous pourrez ensuite accepter le devis dans « Mes Devis ».',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.btn-commander-direct',
          popover: {
            title: '4. Ou passer une commande directe',
            description:
              'Si vous souhaitez réserver immédiatement sans attendre de devis, ce bouton confirme directement votre réservation et vous redirige vers « Mes Commandes ».',
            side: 'top',
            align: 'center'
          }
        }
      ]
      : [
        {
          element: '.panier-vide',
          popover: {
            title: 'Votre panier est actuellement vide',
            description:
              'Ajoutez d’abord des articles depuis le catalogue. Revenez ensuite ici pour ajuster vos quantités, ajouter vos remarques et demander un devis.',
            side: 'top',
            align: 'center'
          }
        }
      ];

    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        // On ne marque le guide comme vu que s'il a été affiché avec un panier rempli
        if (panierRempli) {
          localStorage.setItem(this.TOUR_PANIER_KEY, 'true');
        }
      }
    });

    driverObj.drive();
  }

  /**
   * Lance le guide interactif de la page Mes Devis (expiration, remise, validation).
   */
  lancerGuideDevis(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && this.aDejaVuGuideDevis()) {
      return;
    }

    const aDesDevis = !!document.querySelector('.devis-card');

    const steps: DriveStep[] = aDesDevis
      ? [
        {
          element: '.devis-card .card-header',
          popover: {
            title: '1. Référence et délai d’expiration',
            description:
              'Surveillez le badge en haut à droite : un devis expire automatiquement s’il n’est pas validé à temps. Des rappels vous sont envoyés avant l’échéance pour éviter toute annulation automatique.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.devis-card .card-body',
          popover: {
            title: '2. Dates, montant et remise éventuelle',
            description:
              'Vérifiez ici la période de votre événement et le montant total recalculé. Si notre équipe a appliqué une remise (% ou montant fixe) ou ajusté un tarif, le prix final mis à jour s’affiche directement ici.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.devis-card .btn-info',
          popover: {
            title: '3. Télécharger le devis en PDF',
            description:
              'Téléchargez la version PDF officielle de votre devis pour le consulter hors ligne ou le partager avant de prendre votre décision.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.devis-card .btn-success',
          popover: {
            title: '4. Accepter pour confirmer la réservation',
            description:
              'Cliquez sur « Accepter » pour transformer ce devis en réservation confirmée. Le stock est immédiatement réservé et vous êtes redirigé vers « Mes Commandes » pour procéder au paiement.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.devis-card .btn-danger',
          popover: {
            title: '5. Refuser un devis',
            description:
              'Si la proposition ne vous convient pas, vous pouvez la refuser en indiquant un motif. Vous pourrez créer un nouveau devis à tout moment.',
            side: 'top',
            align: 'center'
          }
        }
      ]
      : [
        {
          element: '.empty-state',
          popover: {
            title: 'Aucun devis en attente',
            description:
              'Dès que vous demanderez un devis depuis votre panier, il apparaîtra ici. Vous pourrez alors vérifier la remise accordée, télécharger le PDF et le valider avant sa date d’expiration.',
            side: 'top',
            align: 'center'
          }
        }
      ];

    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        // On ne marque le guide comme vu que si le client a réellement vu les étapes sur un devis
        if (aDesDevis) {
          localStorage.setItem(this.TOUR_DEVIS_KEY, 'true');
        }
      }
    });

    driverObj.drive();
  }

  /**
   * Lance le guide interactif de la page Mes Commandes (suivi livraison, retour, paiement et factures).
   */
  lancerGuideCommandes(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && this.aDejaVuGuideCommandes()) {
      return;
    }

    const aDesCommandes = !!document.querySelector('.reservation-card');

    const steps: DriveStep[] = aDesCommandes
      ? [
        {
          element: '.stats-cards',
          popover: {
            title: '1. Vue d’ensemble de vos commandes',
            description:
              'Suivez en un coup d’œil le nombre total de vos réservations confirmées, celles en cours et celles terminées.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '#tour-commandes-filtres',
          popover: {
            title: '2. Filtrer et rechercher une commande',
            description:
              'Retrouvez rapidement une réservation grâce à sa référence (ex. RES-2025-001) ou en filtrant par statut.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.reservation-card .card-header',
          popover: {
            title: '3. Suivi de la livraison et du retour',
            description:
              'Les badges indiquent en temps réel l’avancement logistique : En attente → En cours → Livrée, puis après votre événement : En retour / Retour partiel → Retournée.',
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '.reservation-card .card-body',
          popover: {
            title: '4. Paiement (partiel ou complet) et Factures',
            description:
              'Consultez le montant déjà réglé et le solde restant. Vous pouvez effectuer un paiement (D17, virement ou espèces) et télécharger vos factures PDF (Pro-forma ou Finale).',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.reservation-card .card-footer',
          popover: {
            title: '5. Détails, suivi par produit et avis',
            description:
              'Ouvrez les détails de la commande pour suivre chaque produit individuellement, régler le solde ou laisser une évaluation après votre événement.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '.reservation-card .factures-section',
          popover: {
            title: '6. Consulter et télécharger vos factures',
            description:
              'Cliquez sur « Voir les factures » pour afficher les documents déjà générés pour cette réservation (Devis, Pro-forma ou Facture Finale), puis téléchargez-les directement en PDF.',
            side: 'top',
            align: 'center'
          }
        }
      ]
      : [
        {
          element: '.stats-cards',
          popover: {
            title: 'Vos commandes confirmées apparaîtront ici',
            description:
              'Une fois un devis accepté ou une commande passée depuis votre panier, vous pourrez suivre ici la livraison, le retour du matériel, vos paiements et vos factures.',
            side: 'bottom',
            align: 'center'
          }
        }
      ];

    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        if (aDesCommandes) {
          localStorage.setItem(this.TOUR_COMMANDES_KEY, 'true');
        }
      }
    });

    driverObj.drive();
  }

  /**
   * Lance le guide interactif de la page Détails d'une réservation.
   */
  lancerGuideReservationDetails(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && this.aDejaVuGuideReservationDetails()) {
      return;
    }

    const steps: DriveStep[] = [
      {
        element: '.details-header .header-content',
        popover: {
          title: '1. Référence et statuts en temps réel',
          description:
            'Retrouvez ici la référence de votre réservation, son statut global ainsi que l’état actuel de la livraison et du retour de votre matériel.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.paiement-action',
        popover: {
          title: '2. Effectuer un paiement',
          description:
            'Cliquez sur ce bouton pour enregistrer un paiement total ou partiel (acompte) par D17, virement bancaire ou espèces. Ce bouton disparaît automatiquement une fois le solde réglé.',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '.produits-card',
        popover: {
          title: '3. Vos produits réservés',
          description:
            'Retrouvez la liste complète des articles de votre événement. Si la réservation est encore modifiable, vous pouvez également ajouter un produit directement depuis cette zone.',
          side: 'left',
          align: 'start'
        }
      },
      {
        element: '.produit-item',
        popover: {
          title: '4. Détails de chaque ligne de produit',
          description:
            'Chaque ligne affiche la quantité, les dates, les numéros de série attribués (si applicable) et le sous-total. Une fois l’événement terminé, le bouton « Laisser un avis » apparaît ici.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.factures-section',
        popover: {
          title: '5. Vos factures PDF',
          description:
            'Consultez les factures liées à cette réservation (Devis, Pro-forma ou Facture Finale) et téléchargez-les au format PDF.',
          side: 'top',
          align: 'center'
        }
      }
    ];

    // Ignore automatiquement les étapes absentes (ex. .paiement-action si déjà totalement payée)
    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        localStorage.setItem(this.TOUR_RESERVATION_DETAILS_KEY, 'true');
      }
    });

    driverObj.drive();
  }

  aDejaVuGuideCatalogue(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_CATALOGUE_KEY) === 'true';
  }

  aDejaVuGuidePanier(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_PANIER_KEY) === 'true';
  }

  aDejaVuGuideDevis(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_DEVIS_KEY) === 'true';
  }

  aDejaVuGuideCommandes(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_COMMANDES_KEY) === 'true';
  }

  aDejaVuGuideReservationDetails(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_RESERVATION_DETAILS_KEY) === 'true';
  }

  /**
   * Lance le guide interactif de la page Ajouter un Paiement
   * (acompte rapide, modes de paiement, QR code D17, référence et validation).
   */
  lancerGuidePaiement(forcer: boolean = false): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!forcer && this.aDejaVuGuidePaiement()) {
      return;
    }

    const steps: DriveStep[] = [
      {
        element: '.info-section',
        popover: {
          title: '1. Récapitulatif de votre solde',
          description:
            'Vérifiez ici le montant total de votre réservation, ce que vous avez déjà réglé, le reste à payer et la barre d’avancement.',
          side: 'right',
          align: 'start'
        }
      },
      {
        element: '.quick-actions',
        popover: {
          title: '2. Montant libre ou acompte rapide',
          description:
            'Saisissez le montant souhaité ou cliquez sur un raccourci pour régler un acompte de 30 %, 50 % ou directement le solde complet.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '.modes-paiement',
        popover: {
          title: '3. Choisissez votre mode de paiement',
          description:
            'Sélectionnez Espèces, Virement bancaire ou D17. Si vous choisissez D17, le QR Code à scanner avec votre application s’affichera automatiquement juste en dessous.',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: 'input[formControlName="referenceExterne"]',
        popover: {
          title: '4. Référence de transaction',
          description:
            'Indiquez ici le numéro de transaction D17 ou la référence de votre virement (obligatoire pour ces deux modes, optionnel pour les espèces).',
          side: 'top',
          align: 'center'
        }
      },
      {
        element: '.form-actions',
        popover: {
          title: '5. Enregistrement et validation',
          description:
            'Cliquez sur « Enregistrer le paiement ». Il sera soumis pour validation par un administrateur, puis vous recevrez un email de confirmation et pourrez le suivre dans « Mes Paiements ».',
          side: 'top',
          align: 'center'
        }
      }
    ];

    const stepsDisponibles = steps.filter(
      step => !step.element || document.querySelector(step.element as string)
    );

    if (stepsDisponibles.length === 0) {
      return;
    }

    const driverObj = driver({
      showProgress: true,
      progressText: 'Étape {{current}} sur {{total}}',
      nextBtnText: 'Suivant →',
      prevBtnText: '← Précédent',
      doneBtnText: 'Terminer',
      popoverClass: 'elegant-hive-popover',
      allowClose: true,
      steps: stepsDisponibles,
      onDestroyed: () => {
        localStorage.setItem(this.TOUR_PAIEMENT_KEY, 'true');
      }
    });

    driverObj.drive();
  }

  aDejaVuGuidePaiement(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }
    return localStorage.getItem(this.TOUR_PAIEMENT_KEY) === 'true';
  }
}
