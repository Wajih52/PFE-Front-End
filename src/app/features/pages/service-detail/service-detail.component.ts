import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface ServiceData {
  titre: string;
  sousTitre: string;
  descriptionComplete: string;
  imageHero: string;
  equipements: string[];
  pointsForts: string[];
}

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Dictionnaire des contenus pour chaque prestation
  catalogData: Record<string, ServiceData> = {
    'mariages': {
      titre: 'Mariages de Prestige',
      sousTitre: 'Scénographie Raffinée & Ambiance Féerique',
      descriptionComplete: 'Nous concevons l’agencement complet de votre mariage : espaces mariés, centres de tables dorés, assises Napoléon et éclairages féeriques pour une réception d’exception.',
      imageHero: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1500&q=80',
      equipements: ['Tables d’honneur rondes ou rectangulaires', 'Chaises Napoléon cristal ou dorées', 'Arches florales illuminées', 'Art de la table & vaisselle haut de gamme'],
      pointsForts: ['Installation et démontage sur site', 'Conseil scénographique personnalisé', 'Coordination technique']
    },
    'anniversaires': {
      titre: 'Anniversaires & Soirées Festives',
      sousTitre: 'Style, Convivialité & Ambiance Pétillante',
      descriptionComplete: 'Donnez vie à vos anniversaires avec une ambiance sur-mesure : arche de ballons élégante, comptoirs bars éphémères, mobilier lounge et systèmes de sonorisation.',
      imageHero: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1500&q=80',
      equipements: ['Pistes de danse et jeux de lumière', 'Mange-debouts et tabourets hauts', 'Photocall et fonds décoratifs', 'Matériel de sonorisation & micros sans fil'],
      pointsForts: ['Thèmes personnalisables', 'Formules adaptées en intérieur ou plein air', 'Mise en place rapide']
    },
    'fiancailles': {
      titre: 'Fiançailles & Soirées Intimistes',
      sousTitre: 'Élégance Douce & Moments Précieux',
      descriptionComplete: 'Une atmosphère chaleureuse et romantique pour marquer votre engagement : décoration florale délicate, éclairages tamisés et mobilier confort chic.',
      imageHero: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1500&q=80',
      equipements: ['Coins photo romantiques & néons personnalisés', 'Centres de table avec bougies & dorures', 'Canapés et fauteuils d’honneur'],
      pointsForts: ['Agencement intime et soigné', 'Harmonie des couleurs et matières', 'Options d’accueil des invités']
    },
    'evenements-pros': {
      titre: 'Événements Professionnels & Séminaires',
      sousTitre: 'Rigueur, Standing & Confort Technique',
      descriptionComplete: 'Pour vos galas, conférences et lancements d’entreprise, nous fournissons le matériel et la logistique garantissant un rendu impeccable pour vos partenaires.',
      imageHero: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1500&q=80',
      equipements: ['Estrades de scène & pupitres de conférence', 'Projecteurs architecturaux et écrans de retour', 'Tentes et structures modulaires'],
      pointsForts: ['Respect strict des plannings d’installation', 'Matériel entretenu et certifié', 'Support dédié pour entreprises']
    }
  };

  service = signal<ServiceData | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || 'mariages';
      this.service.set(this.catalogData[id] || this.catalogData['mariages']);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  retourAccueil(): void {
    this.router.navigate(['/home']);
  }
}
