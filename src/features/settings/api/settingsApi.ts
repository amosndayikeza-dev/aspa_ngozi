import { resolve } from "node:dns";
import type { PharmacySettings } from "../types";

const DEFAULT_SETTINGS: PharmacySettings = {
    nom: 'Pharmacie Vétérinaire Aspa Ngozi',
    adresse: 'Ngozi, Burundi — Avenue de la Paix',
    telephone: '+257 22 30 45 00',
    email: 'contact@aspangozi.bi',
    devise: 'FBU',
    tva: 0,
    messageTicket: 'Merci de votre visite ! Prenez soin de vos animaux.',
    logoUrl: '', // Sera rempli par l'utilisateur (Base64)
};

export const settingsApi = {
    getSettings: async (): Promise<PharmacySettings> => {
        return new Promise((resolve) => setTimeout(() => resolve({ ...DEFAULT_SETTINGS }), 400));
    },

    updateSettings: async (data: PharmacySettings): Promise<void> => {
        return new Promise((resolve) => {
            console.log("Sauvegarde des parametres : ", data);
            setTimeout(() => resolve(), 600);
        });
    }
};