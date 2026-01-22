// src/app/shared/components/footer/footer.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {color} from 'chart.js/helpers';

interface FooterLink {
  label: string;
  path: string;
}

interface SocialLink {
  icon: string;
  color:string;
  url: string;
  name: string;
}


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
    { icon: 'fab fa-facebook-f fa-2x',color:'#103bf1', url: 'https://facebook.com', name: 'Facebook' },
    { icon: 'fab fa-instagram fa-2x', url: 'https://instagram.com',color:'#ac2bac', name: 'Instagram' },
    { icon: 'fab fa-twitter fa-2x', url: 'https://twitter.com',color:'#55acee', name: 'Twitter' },
    { icon: 'fab fa-linkedin-in fa-2x', url: 'https://linkedin.com',color:'#0082ca', name: 'LinkedIn' },
    { icon: 'fab fa-youtube fa-2x', url: 'https://youtube.com',color:'#ed302f', name: 'YouTube' }
  ];

  /**
   * Scroll vers le haut de la page
   */
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected readonly color = color;
}
