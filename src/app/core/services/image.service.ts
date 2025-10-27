// src/app/core/services/image.service.ts

import { Injectable } from '@angular/core';

/**
 * Service de compression d'images côté frontend
 *
 * Rôle : Réduire la taille de l'image AVANT l'envoi au backend
 *
 * Fonctionnement :
 * 1. Utilisateur sélectionne un fichier (ex: photo 5Mo)
 * 2. Ce service la redimensionne (max 800x800px)
 * 3. Compression JPEG à 80% de qualité
 * 4. Conversion en Base64 : "data:image/jpeg;base64,/9j/4AAQ..."
 * 5. Résultat : ~200Ko au lieu de 5Mo
 */
@Injectable({
  providedIn: 'root'
})
export class ImageService {

  /**
   * Compresse une image et retourne le Base64
   *
   * @param file Fichier image sélectionné par l'utilisateur
   * @returns Promise<string> Base64 de l'image compressée
   */
  compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {

      // 1️⃣ Lire le fichier
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event: any) => {

        // 2️⃣ Créer un élément Image
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {

          // 3️⃣ Créer un canvas pour le redimensionnement
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          // 4️⃣ Calculer les nouvelles dimensions (garder le ratio)
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          // 5️⃣ Redimensionner
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          // 6️⃣ Convertir en Base64 avec compression JPEG 80%
          const base64 = canvas.toDataURL('image/jpeg', 0.8);

          // 7️⃣ Retourner le résultat
          resolve(base64);
        };

        img.onerror = () => reject('Erreur chargement image');
      };

      reader.onerror = () => reject('Erreur lecture fichier');
    });
  }
}
