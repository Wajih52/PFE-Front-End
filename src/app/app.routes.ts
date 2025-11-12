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
  {
    path: 'home',
    loadComponent: () => import('./features/pages/home/home.component')
      .then(m => m.HomeComponent)
  },
  // Routes Avec Side Bar
  {
    path: '',
    component: LayoutWithSidebarComponent,
    children: [
      {
        // Routes CLIENT
        path: 'profile',
        canActivate: [authGuard],
        resolve: { auth: authResolver },
        loadComponent: () => import('./features/pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      //Routes Admin
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['ADMIN'])],
        resolve: { auth: authResolver },//  Vérifie token
        children: [
          {
            path: 'users',
            loadComponent: () => import('./features/admin/pages/users-management/users-management.component')
              .then(m => m.UsersManagementComponent)
          },
          { path: 'roles',
            loadComponent: () => import('./features/admin/pages/roles-management/roles-management.component')
              .then(m => m.RolesManagementComponent),
            data: { role: 'ADMIN' }
          },
          {
            path: 'dashboard',
            loadComponent: () => import('./features/admin/pages/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
          },
          // Liste des produits
          {
            path: 'produits',
            component: ProduitsListComponent,
            data: { roles: ['ADMIN', 'MANAGER'] }
          },
          // Création d'un produit
          {
            path: 'produits/create',
            component: ProduitFormComponent,
            data: { roles: ['ADMIN', 'MANAGER'] }
          },
          // Modification d'un produit
          {
            path: 'produits/edit/:id',
            component: ProduitFormComponent,
            data: { roles: ['ADMIN', 'MANAGER'] }
          },{
            path: 'produits/:id/historique',
            component: HistoriqueMouvementComponent,
            data: { roles: ['ADMIN', 'MANAGER'] }
          }
          ,
          // Routes de gestion des instances
          {
            path: 'instances',
            component: InstancesListComponent,
          },
          {
            path: 'instances/new',
            component: InstanceFormComponent,
          },
          {
            path: 'instances/edit/:id',
            component: InstanceFormComponent,
          },
          {
            path: 'instances/:id',
            component: InstanceDetailComponent,
          },
          {
            path: 'devis-validation',
            component: DevisValidationComponent,
            canActivate: [authGuard],
            data: { roles: ['ADMIN', 'MANAGER'] }
          },
          {
            path: 'reservations',
            component: ReservationsAdminComponent,
            canActivate: [authGuard],
            data: { roles: ['ADMIN', 'MANAGER', 'EMPLOYE'] }
          },
          {
            path: 'reservation-details/:id',
            component: ReservationDetailsComponent,
            canActivate: [authGuard],
            data: { roles: ['ADMIN', 'MANAGER', 'EMPLOYE'] }
          }
        ]
      },
      {
        path: 'client',
        children: [

          {
            path: 'mes-commandes',
            component: MesCommandesComponent,
            canActivate: [authGuard],
            data: { role: 'CLIENT' }
          },
          {
            path: 'mes-devis',
            component: MesDevisComponent,
            canActivate: [authGuard],
            data: { role: 'CLIENT' }
          },
          {
            path: 'reservation-details/:id',
            component: ReservationDetailsComponent,
            canActivate: [authGuard],
            data: { role: 'CLIENT' }
          }
        ]
      }
    ]
  },
  {
    path: 'client/catalogue',
    loadComponent: () => import('./features/pages/catalogue-list/catalogue-list.component')
      .then(m => m.CatalogueListComponent),
    canActivate: [authGuard ,roleGuard(['CLIENT'])]
  },
  {
    path: 'client/panier',
    loadComponent: () => import('./features/pages/panier/panier.component')
      .then(m => m.PanierComponent),
    canActivate: [authGuard ,roleGuard(['CLIENT'])]
  },
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
