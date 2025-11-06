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


export const routes: Routes = [


  // Routes d'authentification (non protégées)
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
    path: 'profile',
    canActivate: [authGuard],
    resolve: { auth: authResolver },
    loadComponent: () => import('./features/pages/profile/profile.component')
      .then(m => m.ProfileComponent)
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
 /* {
    path: 'home',
    loadComponent: () => import('./features/pages/home/home.component')
      .then(m => m.HomeComponent)
  },*/
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    resolve: { auth: authResolver },// ✅ Vérifie token + rôle ADMIN
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
      }
      ]
  },
  // ==================== ROUTE RACINE (LANDING) ====================
  // on charge une landing page qui vérifie l'auth et redirige intelligemment
  {
    path: '**',
    loadComponent: () => import('./features/pages/landing/landing.component')
      .then(m => m.LandingComponent)
  },

];
