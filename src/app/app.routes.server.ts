import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ==========================================
  // Routes dynamiques (avec paramètres) → SSR
  // ==========================================

  // Produits & Avis
  { path: 'produits/:id/avis', renderMode: RenderMode.Server },
  { path: 'admin/produits/:id/avis', renderMode: RenderMode.Server },

  // Admin - Gestion Produits
  { path: 'admin/produits/edit/:id', renderMode: RenderMode.Server },

  // Admin - Gestion Instances
  { path: 'admin/instances/edit/:id', renderMode: RenderMode.Server },
  { path: 'admin/instances/historique/:numeroSerie', renderMode: RenderMode.Server },

  // Admin - Réservations
  { path: 'admin/reservation-details/:id', renderMode: RenderMode.Server },

  // Admin - Factures
  { path: 'admin/factures/:id', renderMode: RenderMode.Server },

  // Admin - Livraisons
  { path: 'admin/livraisons/:id', renderMode: RenderMode.Server },

  // Client - Réservations
  { path: 'client/reservation-details/:id', renderMode: RenderMode.Server },

  // Client - Factures
  { path: 'client/mes-factures/:id', renderMode: RenderMode.Server },

  // Client - Avis
  { path: 'client/avis/creer/:idReservation/:idProduit', renderMode: RenderMode.Server },

  // Paiements
  { path: 'reservations/:idReservation/ajouter-paiement', renderMode: RenderMode.Server },

  // ==========================================
  // Routes statiques → Prerender
  // ==========================================
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'home', renderMode: RenderMode.Prerender },
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: 'auth/register', renderMode: RenderMode.Prerender },
  { path: 'access-denied', renderMode: RenderMode.Prerender },

  // ==========================================
  // Fallback → SSR
  // ==========================================
  { path: '**', renderMode: RenderMode.Server }
];
