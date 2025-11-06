// src/app/shared/components/footer/footer.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FooterLink {
  label: string;
  path: string;
}

interface SocialLink {
  icon: string;
  url: string;
  name: string;
}

/**
 * Composant Footer
 * Footer moderne avec liens, infos et réseaux sociaux
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  // Liens services
  servicesLinks: FooterLink[] = [
    { label: 'Mobilier', path: '/services/mobilier' },
    { label: 'Décoration', path: '/services/decoration' },
    { label: 'Éclairage', path: '/services/eclairage' },
    { label: 'Sonorisation', path: '/services/sonorisation' },
    { label: 'Structures', path: '/services/structures' },
    { label: 'Restauration', path: '/services/restauration' }
  ];

  // Liens informations
  infoLinks: FooterLink[] = [
    { label: 'À propos', path: '/about' },
    { label: 'Contact', path: '/contact' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Blog', path: '/blog' }
  ];

  // Liens légaux
  legalLinks: FooterLink[] = [
    { label: 'Mentions Légales', path: '/legal/mentions' },
    { label: 'Politique de Confidentialité', path: '/legal/privacy' },
    { label: 'CGV', path: '/legal/cgv' },
    { label: 'CGU', path: '/legal/cgu' }
  ];

  // Réseaux sociaux
  socialLinks: SocialLink[] = [
    { icon: '📘', url: 'https://facebook.com', name: 'Facebook' },
    { icon: '📷', url: 'https://instagram.com', name: 'Instagram' },
    { icon: '🐦', url: 'https://twitter.com', name: 'Twitter' },
    { icon: '💼', url: 'https://linkedin.com', name: 'LinkedIn' },
    { icon: '📺', url: 'https://youtube.com', name: 'YouTube' }
  ];

  /**
   * Scroll vers le haut de la page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
