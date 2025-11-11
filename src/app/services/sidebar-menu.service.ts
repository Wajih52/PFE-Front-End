// src/app/core/services/sidebar-menu.service.ts

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MenuItem, MenuSection } from '../core/models/menu-item.model';
import { AuthService } from '../core/services/auth.service';

/**
 * Service de gestion des menus de la sidebar et du dropdown profil
 * Configuration centralisée et extensible des menus par rôle
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarMenuService {
  private authService = inject(AuthService);
  private router = inject(Router);

  // ==================== CONFIGURATION DES MENUS PAR RÔLE ====================

  /**
   * Configuration complète des menus par rôle
   * ⚡ Pour ajouter un nouvel élément, modifiez simplement cette configuration
   */
  private readonly MENU_CONFIG: Record<string, MenuSection[]> = {
    // ========== MENUS CLIENT ==========
    CLIENT: [
      {
        title: 'Mon Espace',
        items: [
          {
            id: 'profile',
            label: 'Mon Profil',
            icon: '👤',
            route: '/profile',
            order: 1
          },
          {
            id: 'orders',
            label: 'Mes Commandes',
            icon: '📦',
            route: '/mes-commandes',
            order: 2
          },
          {
            id: 'quotes',
            label: 'Mes Devis',
            icon: '📄',
            route: '/mes-devis',
            order: 3
          },
          {
            id: 'favorites',
            label: 'Mes Favoris',
            icon: '❤️',
            route: '/mes-favoris',
            order: 4
          },
          {
            id: 'cart',
            label: 'Mon Panier',
            icon: '🛒',
            route: '/panier',
            order: 5
          }
        ]
      },
      {
        title: 'Facturation',
        items: [
          {
            id: 'invoices',
            label: 'Mes Factures',
            icon: '🧾',
            route: '/mes-factures',
            order: 6
          },
          {
            id: 'payments',
            label: 'Mes Paiements',
            icon: '💳',
            route: '/mes-paiements',
            order: 7
          },
          {
            id: 'coupons',
            label: 'Mes Coupons',
            icon: '🎫',
            route: '/mes-coupons',
            order: 8
          }
        ]
      },
      {
        title: 'Support',
        items: [
          {
            id: 'reclamations',
            label: 'Mes Réclamations',
            icon: '⚠️',
            route: '/mes-reclamations',
            order: 9
          },
          {
            id: 'evaluations',
            label: 'Mes Évaluations',
            icon: '⭐',
            route: '/mes-evaluations',
            order: 10
          }
        ]
      }
    ],

    // ========== MENUS EMPLOYE ==========
    EMPLOYE: [
      {
        title: 'Gestion',
        items: [
          {
            id: 'dashboard-employe',
            label: 'Tableau de bord',
            icon: '📊',
            route: '/employe/dashboard',
            order: 1
          },
          {
            id: 'reservations-employe',
            label: 'Réservations',
            icon: '📋',
            route: '/employe/reservations',
            order: 2
          },
          {
            id: 'livraisons',
            label: 'Livraisons',
            icon: '🚚',
            route: '/employe/livraisons',
            order: 3
          },
          {
            id: 'retours',
            label: 'Retours',
            icon: '↩️',
            route: '/employe/retours',
            order: 4
          },
          {
            id: 'stock-employe',
            label: 'Gestion Stock',
            icon: '📦',
            route: '/employe/stock',
            order: 5
          }
        ]
      },
      {
        title: 'Support',
        items: [
          {
            id: 'reclamations-employe',
            label: 'Réclamations Clients',
            icon: '⚠️',
            route: '/employe/reclamations',
            order: 6
          }
        ]
      }
    ],

    // ========== MENUS MANAGER ==========
    MANAGER: [
      {
        title: 'Management',
        items: [
          {
            id: 'dashboard-manager',
            label: 'Tableau de bord',
            icon: '📊',
            route: '/manager/dashboard',
            order: 1
          },
          {
            id: 'reservations-manager',
            label: 'Toutes Réservations',
            icon: '📋',
            route: '/manager/reservations',
            order: 2
          },
          {
            id: 'devis-validation',
            label: 'Validation Devis',
            icon: '✅',
            route: '/manager/devis',
            order: 3
          },
          {
            id: 'equipe',
            label: 'Gestion Équipe',
            icon: '👥',
            route: '/manager/equipe',
            order: 4
          },
          {
            id: 'statistiques',
            label: 'Statistiques',
            icon: '📈',
            route: '/manager/statistiques',
            order: 5
          }
        ]
      }
    ],

    // ========== MENUS ADMIN ==========
    ADMIN: [
      {
        title: 'Administration',
        items: [
          {
            id: 'dashboard-admin',
            label: 'Tableau de bord',
            icon: '🎛️',
            route: '/admin/dashboard',
            order: 1
          },
          {
            id: 'users-management',
            label: 'Gestion Utilisateurs',
            icon: '👥',
            route: '/admin/users',
            order: 2
          },
          {
            id: 'roles-management',
            label: 'Gestion Rôles',
            icon: '🔑',
            route: '/admin/roles',
            order: 3
          },
          {
            id: 'products-management',
            label: 'Gestion Produits',
            icon: '📦',
            route: '/admin/produits',
            order: 4
          },
          {
            id: 'stock-management',
            label: 'Gestion Stock',
            icon: '📊',
            route: '/admin/stock',
            order: 5
          }
        ]
      },
      {
        title: 'Réservations & Finances',
        items: [
          {
            id: 'reservations-admin',
            label: 'Toutes Réservations',
            icon: '📋',
            route: '/admin/reservations',
            order: 6
          },
          {
            id: 'devis-admin',
            label: 'Validation Devis',
            icon: '✅',
            route: '/admin/devis',
            order: 7
          },
          {
            id: 'paiements-admin',
            label: 'Gestion Paiements',
            icon: '💳',
            route: '/admin/paiements',
            order: 8
          },
          {
            id: 'factures-admin',
            label: 'Toutes Factures',
            icon: '🧾',
            route: '/admin/factures',
            order: 9
          }
        ]
      },
      {
        title: 'Logistique',
        items: [
          {
            id: 'livraisons-admin',
            label: 'Gestion Livraisons',
            icon: '🚚',
            route: '/admin/livraisons',
            order: 10
          },
          {
            id: 'retours-admin',
            label: 'Gestion Retours',
            icon: '↩️',
            route: '/admin/retours',
            order: 11
          },
          {
            id: 'calendrier',
            label: 'Calendrier Global',
            icon: '📅',
            route: '/admin/calendrier',
            order: 12
          }
        ]
      },
      {
        title: 'Support & Qualité',
        items: [
          {
            id: 'reclamations-admin',
            label: 'Réclamations',
            icon: '⚠️',
            route: '/admin/reclamations',
            order: 13
          },
          {
            id: 'evaluations-admin',
            label: 'Évaluations',
            icon: '⭐',
            route: '/admin/evaluations',
            order: 14
          },
          {
            id: 'notifications-admin',
            label: 'Notifications',
            icon: '🔔',
            route: '/admin/notifications',
            order: 15
          }
        ]
      },
      {
        title: 'Rapports',
        items: [
          {
            id: 'statistiques-admin',
            label: 'Statistiques',
            icon: '📈',
            route: '/admin/statistiques',
            order: 16
          },
          {
            id: 'rapports',
            label: 'Rapports',
            icon: '📑',
            route: '/admin/rapports',
            order: 17
          }
        ]
      }
    ]
  };

  /**
   * Menu du dropdown profil (commun à tous les rôles)
   */
  private readonly PROFILE_DROPDOWN_ITEMS: MenuItem[] = [
    {
      id: 'profile-view',
      label: 'Mon Profil',
      icon: '👤',
      route: '/profile',
      order: 1
    },
    {
      id: 'profile-settings',
      label: 'Paramètres',
      icon: '⚙️',
      route: '/settings',
      order: 2
    },
    {
      id: 'divider-1',
      label: '---', // Séparateur visuel
      disabled: true,
      order: 3
    },
    {
      id: 'logout',
      label: 'Déconnexion',
      icon: '🚪',
      action: () => this.handleLogout(),
      order: 4,
      customClass: 'logout-item'
    }
  ];

  // ==================== MÉTHODES PUBLIQUES ====================

  /**
   * Obtenir tous les menus de la sidebar pour l'utilisateur connecté
   * Combine les menus de TOUS ses rôles
   */
  getSidebarMenus(): Observable<MenuSection[]> {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.roles) {
          return [];
        }

        // Récupérer les rôles de l'utilisateur
        const userRoles = user.roles.map((r: any) => r.nom || r);

        // Combiner les menus de tous les rôles
        const allMenus: MenuSection[] = [];

        userRoles.forEach((role: string) => {
          const roleMenus = this.MENU_CONFIG[role];
          if (roleMenus) {
            allMenus.push(...roleMenus);
          }
        });

        return this.deduplicateAndSortMenus(allMenus);
      })
    );
  }

  /**
   * Obtenir les éléments du dropdown profil
   * Ajoute les menus spécifiques aux rôles (ex: Dashboard pour ADMIN)
   */
  getProfileDropdownItems(): Observable<MenuItem[]> {
    return this.authService.currentUser$.pipe(
      map(user => {
        const items = [...this.PROFILE_DROPDOWN_ITEMS];

        if (!user || !user.roles) {
          return items;
        }

        const userRoles = user.roles.map((r: any) => r.nom || r);

        // Ajouter des liens spécifiques selon les rôles
        const roleSpecificItems: MenuItem[] = [];

        if (userRoles.includes('ADMIN')) {
          roleSpecificItems.push({
            id: 'admin-dashboard',
            label: 'Dashboard Admin',
            icon: '🎛️',
            route: '/admin/dashboard',
            order: 1
          });
        }

        if (userRoles.includes('MANAGER')) {
          roleSpecificItems.push({
            id: 'manager-dashboard',
            label: 'Dashboard Manager',
            icon: '📊',
            route: '/manager/dashboard',
            order: 1
          });
        }

        if (userRoles.includes('EMPLOYE')) {
          roleSpecificItems.push({
            id: 'employe-dashboard',
            label: 'Dashboard Employé',
            icon: '📋',
            route: '/employe/dashboard',
            order: 1
          });
        }

        // Fusionner et trier
        return [...roleSpecificItems, ...items].sort((a, b) =>
          (a.order || 999) - (b.order || 999)
        );
      })
    );
  }

  /**
   * Vérifier si l'utilisateur a accès à un menu item
   */
  hasAccess(item: MenuItem): Observable<boolean> {
    if (!item.requiredRoles || item.requiredRoles.length === 0) {
      return this.authService.isAuthenticated$;
    }

    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user || !user.roles) {
          return false;
        }

        const userRoles = user.roles.map((r: any) => r.nom || r);
        return item.requiredRoles!.some(role => userRoles.includes(role));
      })
    );
  }

  // ==================== MÉTHODES PRIVÉES ====================

  /**
   * Dédupliquer et trier les menus par ordre
   */
  private deduplicateAndSortMenus(sections: MenuSection[]): MenuSection[] {
    // Groupe par titre de section
    const sectionMap = new Map<string, MenuSection>();

    sections.forEach(section => {
      const key = section.title || 'default';

      if (sectionMap.has(key)) {
        const existing = sectionMap.get(key)!;
        // Fusionner les items et dédupliquer par ID
        const itemsMap = new Map<string, MenuItem>();

        [...existing.items, ...section.items].forEach(item => {
          if (!itemsMap.has(item.id)) {
            itemsMap.set(item.id, item);
          }
        });

        existing.items = Array.from(itemsMap.values());
      } else {
        sectionMap.set(key, { ...section });
      }
    });

    // Trier les items dans chaque section
    sectionMap.forEach(section => {
      section.items.sort((a, b) => (a.order || 999) - (b.order || 999));
    });

    return Array.from(sectionMap.values());
  }

  /**
   * Gérer la déconnexion
   */
  private handleLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], {
          queryParams: { logout: 'true' }
        });
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
      }
    });
  }
}
