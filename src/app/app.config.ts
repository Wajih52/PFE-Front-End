// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {provideRouter, withDisabledInitialNavigation} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Gestion des zones Angular (performance)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Configuration du routeur
    provideRouter(routes),

    // Hydratation côté client (SSR)
    provideClientHydration(withEventReplay()),


    // Configuration HTTP avec intercepteurs
    provideHttpClient(
      withFetch(),  // activer l'api fetch (requis pour SSR )
      withInterceptors([
        jwtInterceptor,      // Ajoute automatiquement le token JWT
        errorInterceptor     // Gère les erreurs HTTP (401, 403, 500...)
      ])
    )
  ]
};
