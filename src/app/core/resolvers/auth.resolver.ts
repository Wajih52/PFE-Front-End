// src/app/core/resolvers/auth.resolver.ts
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { of, delay } from 'rxjs';

export const authResolver: ResolveFn<boolean> = (route, state) => {
  const storage = inject(StorageService);
  const token = storage.getToken();
  // Simuler un délai pour éviter le flash
  return of(!!token).pipe(delay(0));
};
