// src/shared/lib/tauri.ts

import { resolve } from "node:dns";

/**
 * Wrapper autour de `invoke` de Tauri.
 *
 * Pourquoi ce fichier existe :
 * - Centralise l'appel au backend Rust en UN seul endroit.
 * - Permet de MOCKER facilement tant que le backend n'est pas prêt.
 * - Si demain on passe de Tauri à REST, on ne modifie QUE ce fichier.
 *
 * En production, ce fichier contiendra :
 *   import { invoke } from '@tauri-apps/api/core';
 *   return invoke<T>(command, args);
 */

//Mode mock active tant que le backend rust n'est pas branche
const USE_MOCK = true;

const Mock_USERS = [
    { id: '1', nom: 'Rakoto Jean', email: 'boss@vetpharma.mg', password: '123456', role: 'PHARMACIEN' as const },
    { id: '2', nom: 'Randria Sarah', email: 'vendeur@vetpharma.mg', password: '123456', role: 'VENDEUR' as const },
    { id: '3', nom: 'Admin Système', email: 'admin@vetpharma.mg', password: '123456', role: 'ADMIN' as const },
];

export async function callBackend<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    //mode mock (dev)
    if (USE_MOCK) {
        //on simule un reseau de 500ms
        await new Promise((resolve) => setTimeout(resolve, 500));

        switch (command) {
            case 'login': {
                const { email, password } = args as { email: string; password: string };
                const user = Mock_USERS.find(
                    (u) => u.email === email && u.password === password
                );
                if (!user) {
                    throw new Error('Email ou mot de passe incorrect');
                }

                //on ne renvoie pas de password au frontend
                const { password: _, ...safeUser } = user;
                return safeUser as T;
            }
            case 'logout':
                return undefined as T;

            default:
                throw new Error(`Commande mock inconnue : ${command}`);
        }
    }

    // --- MODE RÉEL (production, une fois Tauri installé) ---
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke<T>(command, args);
}