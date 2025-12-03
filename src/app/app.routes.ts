// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';
import {authResolver} from './core/resolvers/auth.resolver';
import {ProduitsListComponent} from './features/admin/pages/produits-list/produits-list.component';
import {ProduitFormComponent} from './features/admin/pages/produit-form/produit-form.component';
import {InstancesListComponent} from './features/admin/pages/instances-list/instances-list.component';
import {InstanceFormComponent} from './features/admin/pages/instance-form/instance-form.component';
import {InstanceDetailComponent} from './features/admin/pages/instance-detail/instance-detail.component';
import {HistoriqueMouvementComponent} from './features/admin/pages/historique-mouvement/historique-mouvement.component';
import {LayoutWithSidebarComponent} from './shared/layout-with-sidbar/layout-with-sidbar.component';
import {ReservationDetailsComponent} from './features/client/reservation-details/reservation-details.component';
import {MesDevisComponent} from './features/client/mes-devis/mes-devis.component';
import {MesCommandesComponent} from './features/client/mes-commandes/mes-commandes.component';
import {DevisValidationComponent} from './features/admin/pages/devis-validation/devis-validation.component';
import {ReservationsAdminComponent} from './features/admin/pages/reservations-admin/reservations-admin.component';
import {AjouterPaiementComponent} from './features/pages/paiement/ajouter-paiement/ajouter-paiement.component';
import {ListePaiementsComponent} from './features/pages/paiement/liste-paiements/liste-paiements.component';
import {InstanceHistoriqueComponent} from './features/admin/pages/instance-historique/instance-historique.component';
import {ListeFacturesComponent} from './features/admin/pages/liste-factures/liste-factures.component';
import {DetailFactureComponent} from './features/admin/pages/detail-facture/detail-facture.component';
import {MesFacturesComponent} from './features/client/mes-factures/mes-factures.component';
import {DetailFactureClientComponent} from './features/client/detail-facture-client/detail-facture-client.component';
import {LivraisonsListComponent} from './features/admin/pages/livraisons-list/livraisons-list.component';
import {LivraisonCreateComponent} from './features/admin/pages/livraison-create/livraison-create.component';
import {LivraisonDetailComponent} from './features/admin/pages/livraison-detail/livraison-detail.component';
import {LivraisonEditComponent} from './features/admin/pages/livraison-edit/livraison-edit.component';
import {ReclamationsListComponent} from './features/admin/pages/reclamations-list/reclamations-list.component';
import {MesReclamationsComponent} from './features/client/mes-reclamations/mes-reclamations.component';
import {NouvelleReclamationComponent} from './features/pages/nouvelle-reclamation/nouvelle-reclamation.component';
import {MesNotificationsComponent} from './features/pages/mes-notifications/mes-notifications.component';
import {CalendrierComponent} from './features/pages/calendrier/calendrier.component';
import {PointageEmployeeComponent} from './features/employee/pointage-employee/pointage-employee.component';
import {PointageAdminComponent} from './features/admin/pages/pointage-admin/pointage-admin.component';
import {
  DashboardStatistiquesComponent
} from './features/admin/pages/dashboard-statistiques/dashboard-statistiques.component';
import {DashboardEmployeComponent} from './features/employee/dashboard-employe/dashboard-employe.component';
import {ReservationsEmployeComponent} from './features/employee/reservations-employe/reservations-employe.component';
import {LivraisonsEmployeComponent} from './features/employee/livraisons-employe/livraisons-employe.component';
import {GestionEquipeComponent} from './features/manager/gestion-equipe/gestion-equipe.component';


export const routes: Routes = [
// des routes publiques pour authentification et inscription
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register.component')
          .then(m => m.RegisterComponent)
      },
      {
        path: 'oauth2/redirect',
        loadComponent: () => import('./features/auth/pages/oauth2-redirect/oauth2-redirect.component')
          .then(m => m.OAuth2RedirectComponent)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component')
          .then(m => m.ForgotPasswordComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent)
      },
      {
        path: 'first-login',
        loadComponent: () => import('./features/auth/pages/first-login/first-login.component')
          .then(m => m.FirstLoginComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./features/auth/pages/change-password/change-password.component')
          .then(m => m.ChangePasswordComponent)
      }
    ]
  },
  // ==================== ROUTES PUBLIQUES - HOME & CONSULTATION AVIS ====================
  {
    path: 'home',
    loadComponent: () => import('./features/pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'produits/:id/avis',
    loadComponent: () => import('./features/pages/produit-avis-public/produit-avis-public.component')
      .then(m => m.ProduitAvisPublicComponent),
    title: 'Avis du Produit'
  },
  // ==================== ROUTES AVEC SIDEBAR (PROTÉGÉES) ====================
  {
    path: '',
    component: LayoutWithSidebarComponent,
    children: [
      {
        path: 'profile',
        canActivate: [authGuard],
        resolve: { auth: authResolver },
        loadComponent: () => import('./features/pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      {
        path: 'notifications',
        component: MesNotificationsComponent,
        canActivate: [authGuard]
      },
      // ============ ROUTES ADMIN ============
      {
        path: 'admin',
        canActivate: [authGuard],
        resolve: { auth: authResolver },//  Vérifie token
        children: [
          // Gestion des utilisateurs
          {
            path: 'users',
            canActivate: [roleGuard(['ADMIN'])],
            loadComponent: () => import('./features/admin/pages/users-management/users-management.component')
              .then(m => m.UsersManagementComponent)
          },
          { path: 'roles',
            canActivate: [roleGuard(['ADMIN'])],
            loadComponent: () => import('./features/admin/pages/roles-management/roles-management.component')
              .then(m => m.RolesManagementComponent),
            data: { role: 'ADMIN' }
          },
          {
            path: 'dashboard',
            canActivate: [roleGuard(['ADMIN'])],
            loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
          },
          // Liste des produits
          {
            path: 'produits',
            canActivate: [roleGuard(['ADMIN','MANAGER'])],
            component: ProduitsListComponent,

          },
          // Création d'un produit
          {
            path: 'produits/create',
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
            component: ProduitFormComponent,

          },
          // Modification d'un produit
          {
            path: 'produits/edit/:id',
            component: ProduitFormComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },{
            path: 'produits/:id/historique',
            component: HistoriqueMouvementComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          }
          ,
          // Routes de gestion des instances
          {
            path: 'instances',
            component: InstancesListComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          {
            path: 'instances/new',
            component: InstanceFormComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          {
            path: 'instances/edit/:id',
            component: InstanceFormComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          {
            path: 'instances/:id',
            component: InstanceDetailComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          {
            path: 'instances/historique/:numeroSerie',
            component: InstanceHistoriqueComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],

          },
          // ======== GESTION DES DEVIS & RÉSERVATIONS ========
          {
            path: 'devis-validation',
            component: DevisValidationComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],

          },
          {
            path: 'reservations',
            component: ReservationsAdminComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          {
            path: 'reservation-details/:id',
            component: ReservationDetailsComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          // ======== GESTION DES PAIEMENTS ========
          {
            path: 'paiements',
            component: ListePaiementsComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],

          },
          // Routes factures
          {
            path: 'factures',
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
            children: [
              {
                path: '',
                component: ListeFacturesComponent,
              },
              {
                path: ':id',
                component: DetailFactureComponent,
              }
            ]
          },
          // ======== GESTION DES LIVRAISONS ========
          {
            path: 'livraisons',
            children: [
              {
                path: '',
                component: LivraisonsListComponent,
                canActivate:  [roleGuard(['ADMIN','MANAGER'])],
              },
              {
                path: 'create',
                component: LivraisonCreateComponent,
                canActivate:  [roleGuard(['ADMIN','MANAGER'])],
              },
              {
                path: ':id',
                component: LivraisonDetailComponent,
                canActivate:  [roleGuard(['ADMIN','MANAGER'])],
              },
              {
                path: ':id/edit',
                component: LivraisonEditComponent,
                canActivate:  [roleGuard(['ADMIN','MANAGER'])],
              },

            ]
          },
          // ======== GESTION DES RÉCLAMATIONS ========
          {
            path: 'reclamations',
            component: ReclamationsListComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          // ======== GESTION DES AVIS ========
          {
            path: 'avis/moderation',
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
            loadComponent: () => import('./features/admin/pages/avis-moderation/avis-moderation.component')
              .then(m => m.AvisModerationComponent),
          },
          {
            path: 'avis/statistiques',
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
            loadComponent: () => import('./features/admin/pages/avis-statistiques/avis-statistiques.component')
              .then(m => m.AvisStatistiquesComponent),

          },
          {
            path: 'produits/:id/avis',
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
            loadComponent: () => import('./features/admin/pages/produit-avis-admin/produit-avis-admin.component')
              .then(m => m.ProduitAvisAdminComponent),
          },
          // ======== CALENDRIER ========
          {
            path: 'calendrier',
            component: CalendrierComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          // ======== GESTION DES POINTAGES ========
          {
            path: 'pointages',
            component: PointageAdminComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          },
          // ======== STATISTIQUES ========
          {
            path: 'statistiques',
            component: DashboardStatistiquesComponent,
            canActivate:  [roleGuard(['ADMIN','MANAGER'])],
          }
        ]
      },
      // ============ ROUTES CLIENT ============
      {
        path: 'client',
        canActivate: [authGuard],
        children: [

          {
            path: 'mes-commandes',
            component: MesCommandesComponent,
            canActivate: [roleGuard(['CLIENT'])]
          },
          {
            path: 'mes-devis',
            component: MesDevisComponent,
            canActivate: [roleGuard(['CLIENT'])]
          },
          {
            path: 'reservation-details/:id',
            component: ReservationDetailsComponent,
            canActivate: [roleGuard(['CLIENT'])]
          },

          {
            path: 'mes-paiements',
            canActivate: [roleGuard(['CLIENT'])],
            loadComponent: () => import('./features/client/mes-paiements/mes-paiements.component')
              .then(m => m.MesPaiementsComponent)
          },
          {
            path: 'mes-factures',
            canActivate: [roleGuard(['CLIENT'])],
            children: [
              {
                path: '',
                component: MesFacturesComponent,
              },
              {
                path: ':id',
                component: DetailFactureClientComponent
              },
            ]
          },
          {
            path: 'mes-avis',
            canActivate: [roleGuard(['CLIENT'])],
            loadComponent: () => import('./features/client/mes-avis/mes-avis.component')
              .then(m => m.MesAvisComponent),
          },
          {
            path: 'avis/creer/:idReservation/:idProduit',
            canActivate: [roleGuard(['CLIENT'])],
            loadComponent: () => import('./features/client/avis-create/avis-create.component')
              .then(m => m.AvisCreateComponent),

          },
          {
            path: 'avis/modifier/:idAvis',
            canActivate: [roleGuard(['CLIENT'])],
            loadComponent: () => import('./features/client/avis-edit/avis-edit.component')
              .then(m => m.AvisEditComponent),

          },
          {
            path: 'catalogue',
            loadComponent: () => import('./features/pages/catalogue-list/catalogue-list.component')
              .then(m => m.CatalogueListComponent),
            canActivate: [roleGuard(['CLIENT'])]
          },
          {
            path: 'panier',
            loadComponent: () => import('./features/pages/panier/panier.component')
              .then(m => m.PanierComponent),
            canActivate: [roleGuard(['CLIENT'])]
          },
        ]
      },
      // ============ AJOUT PAIEMENT (CLIENT,Manager,ADMIN) ============
      {
        path: 'reservations/:idReservation/ajouter-paiement',
        component: AjouterPaiementComponent,
        canActivate: [authGuard,roleGuard(['CLIENT','MANAGER','ADMIN'])],
      },
      // ==================== POINTAGE TOUTES EMPLOYÉ ====================
      {
        path: 'pointage',
        component: PointageEmployeeComponent,
        canActivate: [authGuard,roleGuard(['EMPLOYE','MANAGER','ADMIN'])],
      },
      // ==================== ROUTES EMPLOYÉ ====================
      {
        path: 'employe',
        canActivate: [authGuard],
        children: [
          {
            path: 'dashboard',
            component: DashboardEmployeComponent,
            canActivate: [roleGuard(['EMPLOYE'])],
          },
          {
            path: 'reservations',
            component: ReservationsEmployeComponent,
            canActivate: [roleGuard(['EMPLOYE'])],
          },
          {
            path: 'livraisons',
            component: LivraisonsEmployeComponent,
            canActivate: [roleGuard(['EMPLOYE'])],
          },
        ]
      },
      // ==================== ROUTES MANAGER ====================
      {
        path: 'manager',
        canActivate: [authGuard],
        children: [
          {
            path: 'equipe',
            component: GestionEquipeComponent,
            canActivate: [roleGuard(['MANAGER'])],
          }
        ]
      },
      // ==================== RECLAMATIONS TOUTES EMPLOYÉ ET CLIENT  ====================
      {
        path: 'reclamations/mes-reclamations',
        component: MesReclamationsComponent,
        canActivate: [authGuard,roleGuard(['EMPLOYE','MANAGER','CLIENT'])],
      },
      {
        path: 'reclamations/nouvelle-reclamation',
        component: NouvelleReclamationComponent,
        canActivate: [authGuard,roleGuard(['EMPLOYE','MANAGER','CLIENT'])],
      },
    ]
  },

  // ==================== ROUTES UTILITAIRES ====================
  {
    path: 'loading',
    loadComponent: () => import('./features/pages/loading/loading.component')
      .then(m => m.LoadingComponent)
  },
  {
    path: 'test-jwt',
    loadComponent: () => import('./test-jwt/test-jwt.component')
      .then(m => m.TestJwtComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./shared/access-denied/access-denied.component')
      .then(m => m.AccessDeniedComponent)
  },
  // ==================== ROUTE RACINE (LANDING) ====================
  // on charge une landing page qui vérifie l'auth et redirige intelligemment
  {
    path: '**',
    loadComponent: () => import('./features/pages/landing/landing.component')
      .then(m => m.LandingComponent)
  },

];
