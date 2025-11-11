// src/app/core/models/menu-item.model.ts

/**
 * Interface pour définir un élément de menu (sidebar ou dropdown)
 * Permet une configuration flexible et extensible
 */
export interface MenuItem {
  /** Identifiant unique de l'élément */
  id: string;

  /** Libellé affiché à l'utilisateur */
  label: string;

  /** Icône (classe Font Awesome, Material Icons, ou emoji) */
  icon?: string;

  /** Route Angular vers laquelle naviguer */
  route?: string;

  /** Rôles autorisés à voir cet élément (si vide, visible par tous les connectés) */
  requiredRoles?: string[];

  /** Fonction callback à exécuter au clic (alternative à route) */
  action?: () => void;

  /** Badge avec compteur (ex: nombre de commandes en cours) */
  badge?: {
    value: number | string;
    type: 'info' | 'success' | 'warning' | 'danger';
  };

  /** Sous-menu (pour créer des menus hiérarchiques) */
  children?: MenuItem[];

  /** Désactiver l'élément */
  disabled?: boolean;

  /** Classe CSS personnalisée */
  customClass?: string;

  /** Ordre d'affichage (plus petit = plus haut) */
  order?: number;
}

/**
 * Interface pour grouper les menu items par section
 */
export interface MenuSection {
  /** Titre de la section */
  title?: string;

  /** Éléments de menu de cette section */
  items: MenuItem[];

  /** Icône de la section */
  icon?: string;

  /** Sépare visuellement les sections */
  separator?: boolean;
}
