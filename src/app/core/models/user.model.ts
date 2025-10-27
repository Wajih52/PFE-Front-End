

/**
 * Énumérations correspondant aux enums Java
 */
export enum StatutCompte {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  DESACTIVE = 'DESACTIVE'

}

export enum StatutEmp {
  EN_TRAVAIL = 'EnTravail',
  EN_CONGE = 'EnConge',
  DEMISSIONNE = 'Demissionne'
}

/**
 * Inscription utilisateur (UtilisateurInscriptionDto.java)
 */
export interface UserRegistration {
  nom: string;
  prenom: string;
  pseudo: string;
  email: string;
  motDePasse: string;
  telephone: number;
  genre?: string;  // Optionnel
  adresse?: string;  // Optionnel
}

/**
 * Réponse utilisateur complète (UtilisateurResponseDto.java)
 */
export interface UserResponse {
  idUtilisateur: number;
  codeUtilisateur: string;
  nom: string;
  prenom: string;
  pseudo: string;
  genre?: string;
  telephone: number;
  adresse?: string;
  email: string;
  image?: string;
  etatCompte: StatutCompte;
  poste?: string;
  dateEmbauche?: Date;
  dateFinContrat?: Date;
  statutEmploye?: StatutEmp;
  requirePasswordChange : boolean ;
  bio?: string;
  roles: string[];
}

/**
 * Création/Modification utilisateur (UtilisateurRequestDto.java)
 */
export interface UserRequest {
  codeUtilisateur?: string;
  nom: string;
  prenom: string;
  pseudo: string;
  genre?: string;
  telephone: number;
  adresse?: string;
  email: string;
  motDePasse?: string;
  image?: string;
  etatCompte: StatutCompte;
  poste?: string;
  dateEmbauche?: Date;
  dateFinContrat?: Date;
  statutEmploye?: StatutEmp;
  bio?: string;
  role?: string;
}

/**
 * Modification partielle (UtilisateurRequestPatchDto.java)
 */
export interface UserPatchRequest {
  codeUtilisateur?: string;
  nom?: string;
  prenom?: string;
  pseudo?: string;
  genre?: string;
  telephone?: number;
  adresse?: string;
  email?: string;
  motDePasse?: string;
  image?: string;
  etatCompte?: StatutCompte;
  poste?: string;
  dateEmbauche?: Date;
  dateFinContrat?: Date;
  statutEmploye?: StatutEmp;
  bio?: string;
}
