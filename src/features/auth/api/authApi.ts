import { callBackend } from "@/shared/lib/tauri";   
import type { LoginCredentials, User } from "../types";

/** Contient tous les appels backend lies  l'authentification */
export const authApi = {

    /**
     * connecte un utilisateur
     * @throws error si les identifiants sont invalides
    */
    login: (credentials: LoginCredentials): Promise<User> =>
        callBackend<User>('login', { ...credentials }),
    
    /**
     * Deconnecte l'utilisateur cote backend 
     */

    logout: (): Promise<void> =>
        callBackend<void>('logout'),
}