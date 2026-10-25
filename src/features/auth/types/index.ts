/**les 3 roles de l'application.
 * l'application doit utiliser toutes ces 3 roles seulement
 */
export type UserRole = 'PHARMACIEN' | 'VENDEUR' | 'ADMIN';

/** ces donnees representent un utilisateur connecte */
export interface User{
    id: string;
    nom: string;
    email: string;
    role: UserRole;
}

/** Payload envoye a l'API  du login */
export interface LoginCredentials{
    email: string;
    password: string;
}

/** reponse de l'API  au login */
export interface LoginResponse{
    user: User;
    token: string;
}

/**
 * Etat du AuthProvider
 * On modelise l'etat comme une machine a 3 etats
 * initializing : on vérifie si un token existe
 *   - authenticated : un user est connecté
 *   - unauthenticated : personne n'est connecté
 */
export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated';

export interface AuthState{
    status: AuthStatus;
    user: User | null;
}