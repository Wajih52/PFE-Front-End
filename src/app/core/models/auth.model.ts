
export interface AuthRequest {
  identifiant: string;  // pseudo ou email
  motDePasse: string;
}


export interface AuthResponse {
  token: string;  // JWT token
}


export interface PasswordResetRequest {
  email: string;
}


export interface PasswordReset {
  token: string;
  nouveauMotDePasse: string;
}
